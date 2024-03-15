import Box from '@mui/material/Box'
import SelectMode from '~/components/ModeSelect/SelectMode'
import AppsIcon from '@mui/icons-material/Apps'
import { ReactComponent as TrelloLogo} from '~/assets/trello.svg'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Workspaces from './Menus/workspaces'
import Recent from './Menus/Recent'
import Templates from './Menus/Templates'
import Starred from './Menus/Starred'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Profiles from './Menus/Proflies'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react' // khi cập nhật sẽ render lại component

const AppBar = () => {

  const [ searchValue, setSearchValue] = useState('')

  return (
    <div>
      <Box px={2} sx={{
            // backgroundColor: 'primary.light' ,
            width: '100%',
            height: (theme) => theme.hoCustom.appBarHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            overflowX: 'auto',
            bgcolor: (theme)=> (theme.palette.mode === 'dark' ? '#2c3e50' : '#1565c0')
          }}>
          <Box sx={{ display: 'flex', alignItems:' center', gap: 2}}>
            <AppsIcon sx={{color: 'white'}} />
            <Box sx={{ display: 'flex', alignItems:' center', gap: 0.5}}>
              <SvgIcon component={TrelloLogo} inheritViewBox sx={{color: 'white'}}/>
              <Typography variant='span' sx={{fontSize: '1.2rem', fontWeight: 'bold', color: 'white'}}>
                 Trello 
              </Typography>
            </Box>
            
            <Box sx={{  display: {xs: 'none', md: 'flex'}, gap: 1}}>
              <Workspaces/>
              <Recent/>
              <Templates/>
              <Starred/>
              <Button 
                  sx={{
                      color: 'white',
                      border: 'none',
                      '&:hover' : { border: 'none' }
                    }} 
                  variant="outlined" 
                  startIcon={<LibraryAddIcon/>}> Create
              </Button>
            </Box>

          </Box>
          <Box sx={{ display: 'flex', alignItems:' center', gap: 2}}>
            <TextField 
              id="outlined-search" 
              label="Search field" 
              // type="search" 
              type="text" 
              size='small' 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)} //bắt sự kiện onchange
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{color: 'white'}}/>
                  </InputAdornment>
                ),
                endAdornment: (
                  <CloseIcon 
                    fontSize='small'
                    sx={{ color: searchValue ? 'white' : 'transparent', cursor: 'pointer'}}
                    onClick = {() => setSearchValue('')} //set về rỗng
                  />
                )
              }}
              sx={{ 
                  minWidth: '110px', 
                  maxWidth: '170px',
                  '& label' : { color: 'white'},
                  '& input' : { color: 'white'},
                  '& label.Mui-focused' : { color: 'white'},
                  '& .MuiOutlinedInput-root' : {
                      '& fieldset': { borderColor: 'white'},
                      '&:hover fieldset': { borderColor: 'white'},
                      '&.Mui-focused fieldset': { borderColor: 'white'}
                  }
                }} 
            />
            <SelectMode/> 
            
            <Tooltip title="nofitications">
              <Badge color="warning" variant="dot" sx={{cursor: 'pointer'}}>
                <NotificationsNoneIcon sx={{color: 'white'}} />
              </Badge>
            </Tooltip>
            <Tooltip title="help">
                <HelpOutlineIcon sx={{cursor: 'pointer', color: 'white'}} />
            </Tooltip>
            {/* Profiles */}
            <Profiles/>
            {/* End Profiles */}
          </Box>
        </Box>
    </div>
  )
}

export default AppBar
