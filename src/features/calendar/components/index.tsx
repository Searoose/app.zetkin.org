import { Box } from '@mui/system';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { Suspense, useEffect, useState } from 'react';

import CalendarDayView from './CalendarDayView';
import CalendarMonthView from './CalendarMonthView';
import CalendarNavBar from './CalendarNavBar';
import CalendarWeekView from './CalendarWeekView';
import usePrevActivityDay from '../hooks/usePrevActivityDay';

import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export enum TimeScale {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

function getTimeScale(timeScaleStr: string) {
  let timeScale = TimeScale.MONTH;
  if (
    timeScaleStr !== undefined &&
    Object.values(TimeScale).includes(timeScaleStr as TimeScale)
  ) {
    timeScale = timeScaleStr as TimeScale;
  }
  return timeScale;
}

function getDateFromString(focusDateStr: string) {
  let date = new Date();
  if (focusDateStr) {
    const d = dayjs.utc(focusDateStr);
    if (d.isValid()) {
      date = d.toDate();
    }
  }
  return date;
}

const Calendar = () => {
  const router = useRouter();

  const orgId = router.query.orgId;

  const focusDateStr = router.query.focusDate as string;
  const [focusDate, setFocusDate] = useState(getDateFromString(focusDateStr));
  const previousActivityDay = usePrevActivityDay(focusDate);

  const timeScaleStr = router.query.timeScale as string;
  const [selectedTimeScale, setSelectedTimeScale] = useState<TimeScale>(
    getTimeScale(timeScaleStr)
  );

  useEffect(() => {
    setFocusDate(getDateFromString(focusDateStr));
  }, [focusDateStr]);

  useEffect(() => {
    setSelectedTimeScale(getTimeScale(timeScaleStr));
  }, [timeScaleStr]);

  useEffect(() => {
    router.query.focusDate = dayjs(focusDate).format('YYYY-MM-DD');
    router.query.timeScale = selectedTimeScale;
    router.push(router, undefined, { shallow: true });
  }, [focusDate, selectedTimeScale]);

  function navigateTo(timeScale: TimeScale, date: Date) {
    setSelectedTimeScale(timeScale);
    setFocusDate(date);
  }

  return (
    <Box display="flex" flexDirection="column" height={'100%'} padding={2}>
      <CalendarNavBar
        focusDate={focusDate}
        onChangeFocusDate={(date) => {
          setFocusDate(date);
        }}
        onChangeTimeScale={(timeScale) => {
          setSelectedTimeScale(timeScale);
        }}
        onStepBackward={() => {
          // Steps back to the last day with an event on day view
          if (selectedTimeScale === TimeScale.DAY && previousActivityDay) {
            setFocusDate(previousActivityDay[0]);
          } else {
            setFocusDate(
              dayjs(focusDate).subtract(1, selectedTimeScale).toDate()
            );
          }
        }}
        onStepForward={() => {
          // Steps forward to the next day with an event on day view
          /*
                if (selectedTimeScale === TimeScale.DAY && lastDayWithEvent) {
                  setFocusDate(new Date(futureDays[1][0]));
                } else {
                  */
          setFocusDate(dayjs(focusDate).add(1, selectedTimeScale).toDate());
          //}
        }}
        orgId={parseInt(orgId as string)}
        timeScale={selectedTimeScale}
      />

      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        marginTop={2}
        overflow="auto"
      >
        <Suspense>
          {selectedTimeScale === TimeScale.DAY && (
            <CalendarDayView
              focusDate={focusDate}
              onClickPreviousDay={(date) => setFocusDate(date)}
              previousActivityDay={previousActivityDay}
            />
          )}
          {selectedTimeScale === TimeScale.WEEK && (
            <CalendarWeekView
              focusDate={focusDate}
              onClickDay={(date) => navigateTo(TimeScale.DAY, date)}
            />
          )}
          {selectedTimeScale === TimeScale.MONTH && (
            <CalendarMonthView
              focusDate={focusDate}
              onClickDay={(date) => navigateTo(TimeScale.DAY, date)}
              onClickWeek={(date) => navigateTo(TimeScale.WEEK, date)}
            />
          )}
        </Suspense>
      </Box>
    </Box>
  );
};

export default Calendar;
