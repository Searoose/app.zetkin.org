import { Dayjs } from 'dayjs';
import { Box, Typography } from '@mui/material';

import theme from 'theme';

export interface DayHeaderProps {
  date: Dayjs;
  focused: boolean;
}

const DayHeader = ({ date, focused }: DayHeaderProps) => {
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(3, 1fr)"
      gridTemplateRows="1fr"
      width="100%"
    >
      {/* Day string */}
      <Box alignItems="center" display="flex" justifyContent="flex-start">
        <Typography color={theme.palette.grey[500]} variant="subtitle2">
          {
            // Localized short-format weeekday
            date.toDate().toLocaleDateString(undefined, { weekday: 'short' })
          }
        </Typography>
      </Box>
      {/* Day number */}
      <Box alignItems="center" display="flex" justifyContent={'space-around'}>
        {/* Circle */}
        <Box
          alignItems="center"
          display="flex"
          justifyContent="center"
          sx={{
            backgroundColor: focused ? theme.palette.primary.main : null,
            borderRadius: '50%',
            color: focused ? 'white' : 'inherit',
            height: '2.1em',
            width: '2.1em',
          }}
        >
          <Typography color={focused ? 'white' : 'inherit'} fontSize="1.2em">
            {date.format('D')}
          </Typography>
        </Box>
      </Box>
      {/* Empty */}
      <Box />
    </Box>
  );
};

export default DayHeader;
