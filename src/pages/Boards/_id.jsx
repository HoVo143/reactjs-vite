// Boards Details
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { toast } from 'react-toastify'
// import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'
import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI, updateBoardDetailsAPI, updateColumnDetailsAPI, moveCardToDifferentColumnAPI, deleteColumnDetailsAPI } from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'
import { mapOrder } from '../../utils/sorts'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

function Board() {
  const [board, setBoard] = useState()

  useEffect(() => {
    // tạm thời fix cứng
    // sau này sẽ sử dụng react-router-dom để lấy chuẩn boardid từ url về
    const boardId = '6601071804abfb737c1e3f65'
    // call api
    fetchBoardDetailsAPI(boardId).then( board => { //board này lấy từ api về
      //sắp xếp thứ tự các columns luôn ở đây trước khi đưa dữ liệu xuống bên dưới các conponent con
      // Hàm mapOrder được sử dụng để sắp xếp lại các cột dựa trên thứ tự được chỉ định trong mảng board.columnOrderIds
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')
      //khi f5 trang web cần xử lý vấn đề kéo thả  vào một column rỗng
      board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        }
        else {
          //sắp xếp thứ tự các cards luôn ở đây trước khi đưa dữ liệu xuống bên dưới các conponent con
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })
      // console.log(board)
      setBoard(board)
    })
  }, [])

  // func này làm nhiệm vụ gọi api tạo mới column và làm lại dữ liệu state board
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })
    // console.log('createdColumn:', createdColumn)
    // khi tạo column mới thì nó sẽ chưa có card, (xử lý kéo thả vào 1 column rỗng)
    createdColumn.cards = [generatePlaceholderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id]
    //cập nhật state board / sau khi tạo mới column ở giao diện sẽ show ra liền thay vì phải F5 lại
    // phía fontend phải tự làm đúng lại state data board (thay vì phải gọi lại api fetchBoardDetailsAPI)
    // push: đẩy vào cuối mảng
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    setBoard(newBoard)
  }

  // func này làm nhiệm vụ gọi api tạo mới card và làm lại dữ liệu state board
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id //ko cần columnId
    })
    // console.log('createdCard:', createdCard)
    //cập nhật state board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {
      //nếu column rỗng thì sẽ chứa 1 placeholder
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = [createdCard._id]
      }
      else {
        //column đã có data thì push vào cuối mảng
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }
    console.log(columnToUpdate)
    setBoard(newBoard)
  }

  // Function này để gọi Api và xử lý kéo thả Column xong xuôi
  // chỉ cần gọi api cập nhật mảng columnOrderIds của board chứa nó (thay đổi vị trí trong mảng)
  const moveColumns = (dndOrderedColumns) => {
    // update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)

    //call api update Board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
  }

  //di chuyển card trong cùng column
  // chỉ cần gọi api cập nhật mảng cardOrderIds của column chứa nó (thay đổi vị trí trong mảng)
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    // update cho chuẩn dữ liệu state Board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    setBoard(newBoard)

    //call api update Column
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  // khi di chuyển card sang column khác
  // b1: cập nhật mảng cardOrderIds của column ban đầu chứa nó (hiểu bản chất là xóa cái _id của card ra khỏi mảng)
  // b2: cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
  // b3: cập nhật lại trường columnId mới của cái Card đã kéo
  // => làm 1 api support riêng
  // currentCardId: id cuả nó
  // prevColumnId: id column trc đó
  // nextColumnId: id column tiếp theo
  // dndOrderedColumns: mảng đã dc cập nhật
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    // update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)

    //call api xử lý BE
    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    // xử lý vấn đề khi kéo card cuối cùng ra khỏi column, column rỗng sẽ có placeholder-card ,cần xóa nó đi để gửi dữ liệu lên phía backend
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds, //tìm ra cái column lấy cardIds ra (là dc cardOrderIds của column cũ sau khi đã cập nhật)
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })
  }

  // xử lý xóa 1 column và card bên trong nó
  const deleteColumnDetails = (columnId) => {
    // console.log('test delete', columnId)
    //update cho chuẩn dữ liệu state board
    const newBoard = { ...board }
    newBoard.columns = newBoard.columns.filter(c => c._id !== columnId)
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== columnId)
    setBoard(newBoard)
    //gọi api sử lí phía be
    deleteColumnDetailsAPI(columnId).then(res => {
      toast.success(res?.deleteResult)
    })
  }

  // loading
  if (!board) {
    return (
      <Box sx={{
        display:'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh',
        bgcolor: '#2c3e50',
        color : 'white'
      }}>
        <CircularProgress />
        <Typography>Chờ Loading data tí...</Typography>
      </Box>
    )
  }
  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar/>
      <BoardBar board = {board} />
      <BoardContent
        board = {board}

        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumns={moveColumns}
        moveCardInTheSameColumn = {moveCardInTheSameColumn}
        moveCardToDifferentColumn = {moveCardToDifferentColumn}
        deleteColumnDetails = {deleteColumnDetails}
      />
    </Container>
  )
}

export default Board
