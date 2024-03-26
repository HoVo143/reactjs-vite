import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
// import ContentCut from '@mui/icons-material/ContentCut'
// import ContentCopy from '@mui/icons-material/ContentCopy'
// import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import Button from '@mui/material/Button'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ListCards from './ListCards/ListCards'
// import { mapOrder } from '~/utils/sorts'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify'
import { useConfirm } from 'material-ui-confirm'
// import { Opacity } from '@mui/icons-material'

function Column({ column, createNewCard, deleteColumnDetails }) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: column._id, data: { ...column } }) // can id de dinh danh keo tha

  const dndKitColumnStyle = {
    touchAction: 'none', //dành cho sensor default dạng PointerSensor
    transform: CSS.Translate.toString(transform), //Translate
    transition,
    //chiều cao phải 100%, nếu ko sẽ lỗi lúc kéo column ngắn qua 1 column dài thì phải kéo ở khu vựa giữa gây khó chịu
    //kết hợp với {...listeners} nằm ở trong box, chứ ko dc nằm ngoài ở thẻ div để tránh trường hợp kéo vào vùng xanh
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  // cards đã đc sắp xếp ở component cha cao nhât (boards/_id.jsx)
  const orderedCards = column.cards

  ////
  // nếu openNewColumnForm là false , khi chạy qua toggle sẽ chuyển về true
  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const [newCardTitle, setNewCardTitle] = useState('')

  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error('Please enter Card Title', { position: 'bottom-right' })
      return
    }
    // console.log(newCardTitle)

    // tạo dữ liệu để gọi api
    const newCardData = {
      title: newCardTitle,
      columnId: column._id
    }
    // Gọi lên props function createNewCard nằm ở component cha cao nhất (boards/_id.jsx)
    // Sau này sẽ đưa dữ liệu Board ra ngoài Redux Global Store để có thể gọi Api ở đây thay vì phải lần
    // lượt gọi ngược lên những component cha phía bên trên
    await createNewCard(newCardData)
    // đóng lại trạng thái thêm Card mới và clear input
    toggleOpenNewCardForm()
    setNewCardTitle('')
  }

  //Xử lý xóa 1 column và card bên trong nó
  const confimDeleteColumn = useConfirm()

  const handleDeleteColumn = () => {
    confimDeleteColumn({
      //custom hiện thông báo xóa
      title: 'Delete Column',
      description: 'this action will permanently delete your column and its cards! are you sure?',
      confirmationText: 'Confim',
      cancellationText: 'Cancel',
      dialogProps: { maxWidth: 'xs' },
      allowClose: false, // tránh nhấp bên ngoài tắt form, mà chỉ chọn 1 trong 2 / cancel or confim
      cancellationButtonProps: { color: 'inherit' },
      confirmationButtonProps: { color: 'primary', variant: 'outlined' }

      // description: 'phải nhập chữ delete mới được tắt :v',
      // confirmationKeyword: 'delete',
      // buttonOrder: ["cancel", "confirm"] //giúp đảo vị trí 2 bên
    }).then(() => {
      // Gọi lên props function deleteColumnDetails nằm ở component cha cao nhất (boards/_id.jsx)
      // Sau này sẽ đưa dữ liệu Board ra ngoài Redux Global Store để có thể gọi Api ở đây thay vì phải lần
      // lượt gọi ngược lên những component cha phía bên trên
      deleteColumnDetails(column._id)
    }).catch(() => {})
  }

  return (
    //phải bọc div ở đây vì vấn đề chiều cao column khi kéo thả
    <div ref={setNodeRef} style={dndKitColumnStyle} {...attributes}>
      <Box
        {...listeners} // lắng nghe kéo thả
        sx={{
          minWidth:'300px',
          maxWidth: '300px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : '#ebecf0'),
          ml: 2,
          borderRadius: '6px',
          height: 'fit-content',
          maxHeight: (theme) => `calc(${theme.hoCustom.boardContentHeight} - ${theme.spacing(5)})`
        }}>
        {/*BOX COLUMN HEADER */}
        <Box sx={{
          height: (theme) => theme.hoCustom.columnHeaderHeight,
          p:2,
          display: 'flex',
          alignItems: 'center',
          justifyContent:'space-between'
        }}>

          <Typography
            variant='h6'
            sx={{
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
            {column?.title}
          </Typography>
          <Box>
            <Tooltip title= "More options">
              <ExpandMoreIcon
                sx={{ color: 'text.primary', cursor: 'pointer' }}
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                endIcon={ <ExpandMoreIcon/> } //mui icon
              />
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown'
              }}
            >
              <MenuItem
                onClick={toggleOpenNewCardForm}
                sx={{
                  '&:hover' : {
                    color: '#079992',
                    '& .add-card-icon': { color: '#079992' }
                  }
                }}>
                <ListItemIcon><AddCardIcon fontSize="small" className='add-card-icon' /></ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              {/* <MenuItem>
                <ListItemIcon><ContentCut fontSize="small" /></ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentPaste fontSize="small" /></ListItemIcon>
                <ListItemText>Pass</ListItemText>
              </MenuItem> */}
              <Divider />
              <MenuItem
                onClick={handleDeleteColumn}
                sx={{
                  '&:hover' : {
                    color: 'warning.dark',
                    '& .delete-forever-icon': { color: 'warning.dark' }
                  }
                }}>
                <ListItemIcon> <DeleteForeverIcon fontSize="small" className='delete-forever-icon' /> </ListItemIcon>
                <ListItemText>Delete this column</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon> <Cloud fontSize="small" /> </ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* END BOX COLUMN HEADER */}

        {/*BOX LIST CARD */}
        <ListCards cards={orderedCards}/>
        {/* END BOX LIST CARD */}

        {/*BOX COLUMN FOOTER */}
        <Box sx={{
          height: (theme) => theme.hoCustom.columnFooterHeight,
          p:2,
          display: 'flex',
          alignItems: 'center',
          justifyContent:'space-between'
        }}>
          {!openNewCardForm
            ? <Box sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent:'space-between'
            }}>
              <Button sx={{
                color: (theme) => (theme.palette.mode === 'dark' ? 'white' : '#079992')
              }} startIcon={<AddCardIcon/>} onClick={toggleOpenNewCardForm} >Add new card</Button>
              <Tooltip title= "Drag to move">
                <DragHandleIcon sx={{ cursor: 'pointer' }}/>
              </Tooltip>
            </Box>
            : <Box sx={{ display:'flex', justifyContent:'center' }}>
              <TextField
                label="Enter card..."
                // type="search"
                type="text"
                size='small'
                variant='outlined'
                autoFocus // dùng để khi nhấp vào button sẽ tự động focus vào
                data-no-dnd="true" // fix lỗi lúc bôi chữ trong ô input trong column
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)} //bắt sự kiện onchange
                sx={{
                  '& label' : { color: 'text.primary' },
                  '& input' : {
                    color: (theme) => theme.palette.mode === 'dark' ? 'white' : '#079992',
                    bgcolor: (theme) => {theme.palette.mode === 'dark' ? '#333643' : 'white'}
                  },
                  '& label.Mui-focused' : { color: (theme) => theme.palette.mode === 'dark' ? 'white' : '#079992' },
                  '& .MuiOutlinedInput-root' : {
                    '& fieldset': { borderColor: (theme) => theme.palette.mode === 'dark' ? 'white' : '#079992' },
                    '&:hover fieldset': { borderColor: (theme) => theme.palette.mode === 'dark' ? 'white' : '#079992'},
                    '&.Mui-focused fieldset': { borderColor: (theme) => theme.palette.mode === 'dark' ? 'white' : '#079992' }
                  },
                  '& .MuiOutlinedInput-input' : {
                    borderRadius: 1
                  }
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, marginLeft: '3px' }}>
                <Button
                  onClick={addNewCard}
                  variant='contained'
                  size='small'
                  sx={{
                    minWidth:'50px',
                    minHeight: '100%',
                    boxShadow: 'none',
                    border: '0.5px solid',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#bdc3c7' : '#079992',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#bdc3c7' : '#079992',
                    '&:hover' : { bgcolor: '#079992' }
                  }}
                > Add </Button>
                <CloseIcon
                  fontSize='small'
                  sx={{
                    minWidth: '40px',
                    minHeight: '100%',
                    color: 'white',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#bdc3c7' : '#079992',
                    '&:hover' : { bgcolor: (theme) => theme.palette.error.main }
                  }}
                  onClick = {toggleOpenNewCardForm} //set về rỗng
                />
              </Box>
            </Box>
          }
        </Box>
        {/*BOX COLUMN END FOOTER */}
      </Box>
    </div>
  )
}

export default Column
