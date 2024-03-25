
import Box from '@mui/material/Box'
import { toast } from 'react-toastify'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'


function ListColumns({ columns, createNewColumn, createNewCard, deleteColumnDetails }) {
  // nếu openNewColumnForm là false , khi chạy qua toggle sẽ chuyển về true
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const [newColumnTitle, setNewColumnTitle] = useState('')

  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('Please enter Column Title')
      return
    }
    // console.log(newColumnTitle)

    // tạo dữ liệu để gọi api
    const newColumnData = {
      title: newColumnTitle
    }
    // Gọi Api ở đây
    await createNewColumn(newColumnData)

    // đóng lại trạng thái thêm column mới và clear input
    toggleOpenNewColumnForm()
    setNewColumnTitle('')
  }

  return (
    <SortableContext items={columns?.map(col => col._id)} strategy={horizontalListSortingStrategy}>
      <Box sx={{
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        bgcolor: 'inherit', // kế thừa th cha
        width: '100%',
        height:'100%',
        '&::-webkit-scrollbar-track' : { m : 2 }
      }}>
        {/* Column */}
        {columns?.map(column => (
          <Column key={column._id} column = {column} createNewCard={createNewCard} deleteColumnDetails={deleteColumnDetails}/>
        ))}

        {/*Box Add new column */}
        {!openNewColumnForm //khi đặt {!openNewColumnForm}, điều đó có nghĩa là hiển thị phần tử khi openNewColumnForm là false.
          ? <Box onClick={toggleOpenNewColumnForm} sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d'
          }}>
            <Button sx={{
              color: 'white',
              width: '100%',
              justifyContent: 'flex-start',
              pl: 2.5,
              py: 1
            }}
            startIcon={<AddToPhotosIcon/>}> Add New Column </Button>
          </Box>
          : <Box sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            p: 1,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d',
            flexDirection: 'column',
            gap: 1
          }}>
            <TextField
              label="Enter column title..."
              // type="search"
              type="text"
              size='small'
              variant='outlined'
              autoFocus // dùng để khi nhấp vào button sẽ tự động focus vào
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)} //bắt sự kiện onchange
              sx={{
                '& label' : { color: 'white' },
                '& input' : { color: 'white' },
                '& label.Mui-focused' : { color: 'white' },
                '& .MuiOutlinedInput-root' : {
                  '& fieldset': { borderColor: 'white' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: 'white' }
                }
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: '10px' }}>
              <Button
                onClick={addNewColumn}
                variant='contained'
                size='small'
                sx={{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.primary.main,
                  bgcolor: (theme) => theme.palette.primary.main,
                  '&:hover' : { bgcolor: (theme) => theme.palette.primary.main }
                }}
              > Add Column </Button>
              <CloseIcon
                fontSize='small'
                sx={{
                  minWidth: '30px',
                  minHeight: '30px',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: '3px',
                  bgcolor: (theme) => theme.palette.primary.main,
                  '&:hover' : { bgcolor: (theme) => theme.palette.error.main }
                }}
                onClick = {toggleOpenNewColumnForm} //set về rỗng
              />
            </Box>
          </Box>
        }
      </Box>
    </SortableContext>
  )
}

export default ListColumns
