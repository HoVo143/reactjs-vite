import Box from '@mui/material/Box'
import Card from './Card/Card'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

function ListCards({ cards }) {
  return (
    <SortableContext items={cards?.map(col => col._id)} strategy={verticalListSortingStrategy}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: '0 5px 5px 5px',
        m: '0 5px',
        overflowX: 'hidden',
        overflowY: 'auto',
        maxHeight: (theme) => `calc(
          ${theme.hoCustom.boardContentHeight} 
          - ${theme.spacing(5)} 
          - ${theme.hoCustom.columnHeaderHeight} 
          - ${theme.hoCustom.columnFooterHeight}
        )`,
        '&::-webkit-scrollbar-thumb' : { backgroundColor: '#ced0da' },
        '&::-webkit-scrollbar-thumb:hover' : { backgroundColor: '#bfc2cf' }
      }}>
        {/* Card */}
        {cards?.map( card => <Card key={card._id} card = {card}/>)}
        {/* end Card */}

      </Box>
    </SortableContext>
  )
}

export default ListCards
