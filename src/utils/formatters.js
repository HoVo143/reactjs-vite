

export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

// Cách xử lý bug logic thư viện dnd-kit khi column rỗng:
// Phía FE sẽ tự tạo ra 1 cái card đặc biệt: Placeholder Card, không liên quan tới Back-end
// Card đặc biệt này sẽ được ẩn ở giao diện UI người dùng
// Mỗi column chỉ có thể tối đa 1 cái Placeholder Card
// Khi tạo phải đầy đủ: (_id, boardId, columnId, FE_PlaceholderCard)
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}