
import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import {
  DndContext,
  // PointerSensor,
  useSensor,
  useSensors,
  // MouseSensor,
  // TouchSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
  // closestCenter
} from '@dnd-kit/core'

// fix lỗi lúc bôi chữ trong ô input trong column
import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors'

import { useCallback, useEffect, useRef, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board, createNewColumn, createNewCard, moveColumns, moveCardInTheSameColumn, moveCardToDifferentColumn, deleteColumnDetails }) {
  //nếu dùng PointerSensor mặc định thì phải kết hợp thuộc tính css touch-action : none ở những nơi kéo thả
  // const pointerSensor = useSensor(PointerSensor, {activationConstraint: {distance: 10}})

  //yêu cầu chuột di chuyển 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  // nhấn giữ 250ms và dung sai của cảm ứng (di chuyển/chênh lệch 500px) thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })
  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  //ưu tiên sử dụng 2 loại sensors là mouse và touch để có trải nghiệm tốt trên mobile, ko bị bug

  // const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, '_id')
  const [orderedColumns, setOrderedColumns] = useState([])
  // cùng 1 thời điểm chỉ có 1 ptu đang dc kéo (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  //điểm va chạm cuối cùng trước đó (xử lý thuật toán va chạm)
  const lastOverId = useRef(null)

  useEffect(() => {
    // Columns đã đc sắp xếp ở component cha cao nhât (boards/_id.jsx)
    setOrderedColumns(board.columns)
  }, [board])

  // tìm 1 column theo cardId
  //hàm này sẽ trả về cột chứa card có cardId được cung cấp. Nếu không tìm thấy card trong bất kỳ cột nào, hàm sẽ trả về undefined.
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find(column => column?.cards?.map(card => card._id )?.includes(cardId))
  }

  //Function chung xử lý việc cập nhật lại state trong trường hợp di chuyển Card giữa các column khác nhau.
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumns(preColumns => {
      //tìm vị trí của cái overcard trong column đích (nơi activecard sắp đc thả)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      //logic tính toán "cardindex mới" (trên or dưới của overcard) lấy chuẩn ra từ code của thư viện
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1
      // console.log('isBelowOverItem', isBelowOverItem)
      // console.log('modifier', modifier)
      // console.log('newCardIndex', newCardIndex)

      //clone mảng orderedColumnsState cũ ra một mảng mới để sử lý data rồi return - cập nhật lại orderedColumnsState mới
      const nextColumns = cloneDeep(preColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      //Column cũ
      if (nextActiveColumn)
      {
        // xóa card ở cái column active ( column cũ, lúc kéo card ra khỏi nó để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Thêm Placeholder Card nếu Column rỗng (Bị kéo hết Card đi, ko còn cái nào).
        if (isEmpty(nextActiveColumn.cards)) {
          // console.log('card cuối cùng bị kéo đi')
          //trả về 1 card duy nhất và bọc trong cái mảng
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }

        //cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }
      //Column mới
      if (nextOverColumn) {
        //kiểm tra xem card đang kéo nó có tồn tại ở overcolumn chưa, nếu có thì xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        //đối với trường hợp dragEnd thì phải cập nhật lại chuần dữ liệu columnId trong card
        // sau khi kéo card giữa 2 column khác nhau.
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        //tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)

        //Xóa Placeholder Card nếu nó đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter( card => !card.FE_PlaceholderCard )

        //cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      //nếu function naỳ được gọi từ moveCardToDifferentColumn nghĩa là đã kéo thả xong, lúc này mới xử lý gọi Api 1 lần ở đây
      if (triggerFrom === 'handleDragEnd') {
        // Gọi lên props function moveCardInTheSameColumn nằm ở component cha cao nhất (boards/_id.jsx)
        // Sau này sẽ đưa dữ liệu Board ra ngoài Redux Global Store để có thể gọi Api ở đây thay vì phải lần
        // lượt gọi ngược lên những component cha phía bên trên
        //** */
        // * phaỉ dùng tới activeDragItemData.columnId hoặc tốt nhất là oldColumnWhenDraggingCard._id (set vao state từ bước handleDragStar)
        // chứ ko phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver và tới đây là state của card đã bị cập nhật 1 lần rồi
        moveCardToDifferentColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        )
      }

      // console.log('nextColumns: ', nextColumns )
      return nextColumns
    })
  }

  // trigger khi bắt đầu kéo một phần tử
  const handleDragStart = (event) => {
    // console.log('handleDragStart: ', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    //nếu là kéo card mới thực hiện hành động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId)
    {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  // trigger trong quá trình kéo (drag) 1 ptu
  const handleDragOver = (event) => {
    //ko làm gì thêm nếu đang kéo columns
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    //còn nếu kéo card thì xử lí thêm để có thể kéo card qua lại giữa các columns
    // console.log('handleDragOver: ',event)
    const { active, over } = event

    //đảm bảo nếu ko tồn tại active or over (khi kéo ra khỏi phạm vi container )
    // thì ko làm gì cả (để tránh crash trang)
    if (!active || !over) return

    //activeDraggingCard là card đang đc kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    //overCard là card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
    const { id: overCardId } = over

    //tìm 2 columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    //dùng để tránh trường hợp dữ liệu ko may bị gì
    // nếu ko tồn tại 1 trong 2 thì ko làm gì hết , tránh crash trang web
    if (!activeColumn || !overColumn) return

    // xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau
    // còn nếu kéo card trong chính column của nó thì ko làm gì
    //vì đây đang là đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác ở (handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      // console.log('code da chay vao day')
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }

  // trigger khi kết thúc hành động kéo (drag) một phần tử => hành động thả (drop)
  const handleDragEnd = (event) => {

    const { active, over } = event
    //đảm bảo nếu ko tồn tại active or over (khi kéo ra khỏi phạm vi container )
    // thì ko làm gì cả (để tránh crash trang)
    if (!active || !over) return

    //Xử lý kéo thả cards
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD)
    {
      //activeDraggingCard là card đang đc kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      //overCard là card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
      const { id: overCardId } = over

      //tìm 2 columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      //dùng để tránh trường hợp dữ liệu ko may bị gì
      // nếu ko tồn tại 1 trong 2 thì ko làm gì hết , tránh crash trang web
      if (!activeColumn || !overColumn) return

      //hành động kéo thả card giữa 2 column khác nhau
      //phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id (set vào state từ bước handleDragStart)
      //chứ ko phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card đã bị cập nhật 1 lần rồi.
      if (oldColumnWhenDraggingCard._id !== overColumn._id)
      {
        // hành động kéo thả card giữa 2 column khác nhau
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )
      }
      else {
        //hành động kéo thả card trong cùng 1 column
        // lay vi tri cũ từ oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // lay vi tri mới từ over
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
        //dùng arrayMove vì kéo card trong một cái column thì tương tự với logic kéo column trong 1 cái boardContent
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        const dndOrderedCardIds = dndOrderedCards.map(card => card._id)
        // console.log( 'dndOrderedCards: ', dndOrderedCards)
        setOrderedColumns(preColumns => {
          //clone mảng orderedColumnsState cũ ra một mảng mới để sử lý data rồi return - cập nhật lại orderedColumnsState mới
          const nextColumns = cloneDeep(preColumns)

          //tìm tới cái column mà chúng ta đang thả
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          //cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCardIds

          // console.log('targetColumn: ', targetColumn)

          //trả về giá trị state mới (chuẩn vị trí)
          return nextColumns
        })

        // Gọi lên props function moveCardInTheSameColumn nằm ở component cha cao nhất (boards/_id.jsx)
        // Sau này sẽ đưa dữ liệu Board ra ngoài Redux Global Store để có thể gọi Api ở đây thay vì phải lần
        // lượt gọi ngược lên những component cha phía bên trên
        moveCardInTheSameColumn(dndOrderedCards, dndOrderedCardIds, oldColumnWhenDraggingCard._id)
      }
    }

    //Xử lý kéo thả columns trong 1 cái boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    {
      //nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if ( active.id !== over.id)
      {
        // lay vi tri cũ tu active
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        // lay vi tri mới tu over
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)
        //dùng arrayMove của dnd-kit để sắp xếp lại mảng columns ban đầu
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)

        // Gọi lên props function createNewCard nằm ở component cha cao nhất (boards/_id.jsx)
        // Sau này sẽ đưa dữ liệu Board ra ngoài Redux Global Store để có thể gọi Api ở đây thay vì phải lần
        // lượt gọi ngược lên những component cha phía bên trên
        moveColumns(dndOrderedColumns)

        // vẫn gọi update state ở đây để tranh delay hoặc flickering giao diện lúc kéo thả cần phải chờ gọi api
        //cập nhật lại state columns sau khi kéo thả
        setOrderedColumns(dndOrderedColumns)
      }
    }

    //những dữ liệu sau khi kéo thả này luôn phải đưa về giá trị null mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  // Animation khi thả drop phần tử  - test bằng cách kéo thả trực tiếp và nhìn phần giữ chỗ Overlay
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  //custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều columns
  const collisionDetectionStrategy = useCallback((args) => { //args =arguments = các đối số, tham số
    // trường hợp kéo column thì dùng thuật toán closestCorners là chuẩn nhất
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    {
      return closestCorners({ ...args })
    }
    //tìm các điểm giao nhau , va chạm - intersections với con trỏ
    const pointerIntersections = pointerWithin(args)

    //nếu pointerIntersections là mảng rỗng, return luôn không làm gì hết
    // fix triệt để cái bug flickering của thư viện dnd-kit:
    // - kéo 1 cái card có img cover lớn và kéo lên phía trên cùng ra khỏi khu vực kéo thả
    if (!pointerIntersections?.length) return
    //thuật toán phát hiện va chạm sẽ trả về một mảng các va chạm ở đây
    // const intersections = !!pointerIntersections?.length ? pointerIntersections : rectIntersection(args)

    //tìm overId đầu tiên trong đám intersections ở trên
    let overId = getFirstCollision( pointerIntersections, 'id' )
    // console.log( 'overId', overId )
    if (overId) {
      // fix cái vụ flickering: nếu cái over nó là column thì sẽ tìm tới cái cardId gần nhất bên trong
      // khu vực va chạm đó dựa vào thuật toán phát hiện va chạm closestCenter hoặc closestCorners đều được
      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        // console.log('overId before: ', overId)
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter( container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
        // console.log('overId after: ', overId)
      }
      lastOverId.current = overId
      return [{ id: overId }]
    }
    // nếu overId là null thì trả về mảng rỗng - tránh bug crash trang
    return lastOverId.current ? [{ id: lastOverId.current }] : []

  }, [activeDragItemType, orderedColumns])


  return (
    <DndContext
      sensors={sensors}
      //thuật toán phát hiện va chạm(dùng để kéo card với cover lớn qua column được,  vì lúc này nó đang bị conflict giữa card và column)
      // dùng closestCorners thay vì closestCenter
      // collisionDetection={closestCorners}
      // Update: nếu chỉ dùng  sẽ có bug flickering với sai lệch dữ liệu
      // Tự custom nâng cao thuật toán phát hiên va chạm
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}>
      <Box sx={{
        width: '100%',
        p: '10px 0',
        height: (theme) => theme.hoCustom.boardContentHeight,
        // bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2')
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#38ada9')
      }}>
        {/* List Columns */}
        <ListColumns
          columns = {orderedColumns}
          createNewColumn = {createNewColumn}
          createNewCard={createNewCard}
          deleteColumnDetails={deleteColumnDetails}/>
        {/* end List Columns */}

        {/* dùng DragOverlay để khi kéo có th giữ chỗ (hiện mờ) */}
        <DragOverlay dropAnimation={customDropAnimation}>
          {/* nếu ko phần tử nào dc kéo thì null */}
          {(!activeDragItemType) && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData}/>}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
