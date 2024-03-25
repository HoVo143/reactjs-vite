import { useColorScheme } from '@mui/material/styles'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import LightModeIcon from '@mui/icons-material/LightMode'
import NightsStayIcon from '@mui/icons-material/NightsStay'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import Box from '@mui/material/Box'

function SelectMode() {
  const { mode, setMode } = useColorScheme()

  const handleChange = (event) => {
    // setAge(event.target.value);
    // const selectedMode = event.target.value
    setMode(event.target.value)
  }
  return (
    <FormControl size="small" sx={{ minWidth: '65px' }}>
      <InputLabel
        id="label-select-dark-light-mode"
        sx={{
          color: 'white',
          '&.Mui-focused' : { color: 'white' }
        }}
      >
          Mode
      </InputLabel>
      <Select
        labelId="label-select-dark-light-mode"
        id="select-dark-light-mode"
        value={mode}
        label="mode"
        onChange={handleChange}
        sx = {{
          color: 'white',
          '.MuiOutlinedInput-notchedOutline' : { borderColor: 'white' },
          '&:hover .MuiOutlinedInput-notchedOutline' : { borderColor: 'white' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline' : { borderColor: 'white' },
          '.MuiSvgIcon-root' : { color: 'white' }
        }}
      >
        <MenuItem value="light">
          <Box style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightModeIcon fontSize='small'/>
          </Box>
        </MenuItem>
        <MenuItem value="dark">
          <Box style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NightsStayIcon fontSize='small'/>
          </Box>
        </MenuItem>
        <MenuItem value='system'>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsBrightnessIcon fontSize='small'/>
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  )
}

export default SelectMode
