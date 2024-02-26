
import Box from '@mui/material/Box'
import SelectMode from '~/components/ModeSelect'

const AppBar = () => {
  return (
    <div>
      <Box sx={{
            backgroundColor: 'primary.light' ,
            width: '100%',
            height: (theme) => theme.hoCustom.appBarHeight,
            display: 'flex',
            alignItems: 'center'
          }}>
          <SelectMode/> 
        </Box>
    </div>
  )
}

export default AppBar
