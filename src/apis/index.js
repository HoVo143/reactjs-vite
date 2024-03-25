import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

// giành cho Boards
// vì sau này file này sẽ có nhiều hàm function
// phía fronend ko cần thiết dùng try catch đối với mọi request bởi nó gây ra dư thừa code catch quá nhiều
export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  //axios sẽ trả kết quả về qua property của nó là data
  return response.data
}
//update
export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  //axios sẽ trả kết quả về qua property của nó là data
  return response.data
}

// giành cho Columns
export const createNewColumnAPI = async (newColumnData) => {
  const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData)
  //axios sẽ trả kết quả về qua property của nó là data
  return response.data
}
//update Columns
export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  //axios sẽ trả kết quả về qua property của nó là data
  return response.data
}

// giành cho Cards
export const createNewCardAPI = async (newCardData) => {
  const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData)
  //axios sẽ trả kết quả về qua property của nó là data
  return response.data
}

// làm 1 api support riêng / khi di chuyển card sang column khác
export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/boards/supports/moving_card`, updateData)
  return response.data
}

// xử lý xóa 1 column và card bên trong nó
export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await axios.delete(`${API_ROOT}/v1/columns/${columnId}`)
  //axios sẽ trả kết quả về qua property của nó là data
  return response.data
}