
import Box from '@mui/material/Box'

function BoardBar() {
  return (
    <div>
      <Box sx={{
            backgroundColor: 'primary.dark' ,
            width: '100%',
            height: (theme) => theme.hoCustom.boardBarHeight,
            display: 'flex',
            alignItems: 'center'
          }}>
            Board Bar
        </Box>
    </div>
  )
}

export default BoardBar
