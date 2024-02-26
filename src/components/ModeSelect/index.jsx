import { useColorScheme } from '@mui/material/styles'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import LightModeIcon from '@mui/icons-material/LightMode'
import NightsStayIcon from '@mui/icons-material/NightsStay'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'

function SelectMode() {
  const {mode, setMode} = useColorScheme()

  const handleChange = (event) => {
    // setAge(event.target.value);
    const selectedMode = event.target.value
    setMode(selectedMode)
  };
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id="label-select-dark-light-mode">mode</InputLabel>
      <Select
        labelId="label-select-dark-light-mode"
        id="select-dark-light-mode"
        value={mode}
        label="mode"
        onChange={handleChange}
      >
        <MenuItem value="light"> 
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <LightModeIcon fontSize='small'/> light
          </div>
        </MenuItem>
        <MenuItem value="dark"> 
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <NightsStayIcon fontSize='small'/> dark
          </div>
        </MenuItem>
        <MenuItem value='system'>  
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <SettingsBrightnessIcon fontSize='small'/> system
          </div>
        </MenuItem>
      </Select>
    </FormControl>
  );
}

export default SelectMode
