// Boards Details
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
// import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'
import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI, updateBoardDetailsAPI } from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'

function Board() {
  const [board, setBoard] = useState()

  useEffect(() => {
    // tạm thời fix cứng
    // sau này sẽ sử dụng react-router-dom để lấy chuẩn boardid từ url về
    const boardId = '6601071804abfb737c1e3f65'
    // call api
    fetchBoardDetailsAPI(boardId).then(( board ) => { //board này lấy từ api về
      //khi f5 trang web cần xử lý vấn đề kéo thả  vào một column rỗng
      board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
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
      columnToUpdate.cards.push(createdCard)
      columnToUpdate.cardOrderIds.push(createdCard._id)
    }
    setBoard(newBoard)
  }

  // Function này để gọi Api và xử lý kéo thả Column xong xuôi
  const moveColumns = async (dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)

    //call api update Board
    await updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar/>
      <BoardBar board = {board} />
      <BoardContent board = {board} createNewColumn={createNewColumn} createNewCard={createNewCard} moveColumns={moveColumns}/>
    </Container>
  )
}

export default Board
