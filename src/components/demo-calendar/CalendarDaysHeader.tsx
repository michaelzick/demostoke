
const CalendarDaysHeader = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-7 border-b">
      {days.map((day) => (
        <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
          {day}
        </div>
      ))}
    </div>
  );
};

export default CalendarDaysHeader;
