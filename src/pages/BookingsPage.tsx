import { useState } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { format, parseISO, addDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { myBookings, bookingsForMyGear, Booking } from "@/lib/mockBookings";
import { useIsMobile } from "@/hooks/use-mobile";

// Helper function to convert dates into a format needed for the calendar
const getDatesInRange = (startDateStr: string, endDateStr: string): Date[] => {
  const startDate = parseISO(startDateStr);
  const endDate = parseISO(endDateStr);

  const dates: Date[] = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
};

// Find all dates that have bookings
const getBookingDates = (bookings: Booking[]): Date[] => {
  return bookings.flatMap(booking =>
    getDatesInRange(booking.startDate, booking.endDate)
  );
};

type ViewMode = "myBookings" | "othersBookings";

const BookingsPage = () => {
  usePageMetadata({
    title: 'My Bookings | DemoStoke',
    description: 'View and manage your DemoStoke gear reservations.'
  });
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("myBookings");
  const isMobile = useIsMobile();

  // Get all dates with bookings based on the current view mode
  const bookedDates = getBookingDates(
    viewMode === "myBookings" ? myBookings : bookingsForMyGear
  );

  // Get bookings for the selected date
  const getBookingsForDate = (date: Date | undefined): Booking[] => {
    if (!date) return [];

    const dateStr = format(date, "yyyy-MM-dd");
    const bookingsToCheck = viewMode === "myBookings" ? myBookings : bookingsForMyGear;

    return bookingsToCheck.filter(booking => {
      const bookingStartDate = parseISO(booking.startDate);
      const bookingEndDate = parseISO(booking.endDate);
      const selectedDate = parseISO(dateStr);

      return selectedDate >= bookingStartDate && selectedDate <= bookingEndDate;
    });
  };

  const bookingsForSelectedDate = getBookingsForDate(date);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <CardTitle>Booking Calendar</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant={viewMode === "myBookings" ? "default" : "outline"}
                    onClick={() => setViewMode("myBookings")}
                    className="w-full sm:w-auto"
                  >
                    Gear I've Booked
                  </Button>
                  <Button
                    variant={viewMode === "othersBookings" ? "default" : "outline"}
                    onClick={() => setViewMode("othersBookings")}
                    className="w-full sm:w-auto"
                  >
                    Gear Others Have Booked
                  </Button>
                </div>
              </div>
              <CardDescription>
                {viewMode === "myBookings"
                  ? "View and manage gear you've rented from others"
                  : "See when your gear has been booked by others"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-3 pointer-events-auto"
                modifiers={{
                  booked: bookedDates
                }}
                modifiersClassNames={{
                  booked: "border-2 border-primary"
                }}
                components={{
                  DayContent: ({ date }) => {
                    const hasBooking = bookedDates.some(
                      bookedDate => format(bookedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                    );

                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {date.getDate()}
                        {hasBooking && (
                          <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>
                {date ? format(date, "MMMM d, yyyy") : "Select a date"}
              </CardTitle>
              <CardDescription>
                {bookingsForSelectedDate.length === 0
                  ? "No bookings for this date"
                  : `${bookingsForSelectedDate.length} booking(s) for this date`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsForSelectedDate.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="mx-auto h-12 w-12 opacity-50 mb-2" />
                  <p>No bookings found for the selected date.</p>
                  <p className="text-sm mt-2">Select a different date or create a new booking.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingsForSelectedDate.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{booking.equipment.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(booking.startDate), "MMM d")} - {format(parseISO(booking.endDate), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex items-center mt-4">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={booking.bookedBy.imageUrl} alt={booking.bookedBy.name} />
                          <AvatarFallback>{booking.bookedBy.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {viewMode === "myBookings" ? "Demoed by " : "Booked by "}
                          {booking.bookedBy.name === "You" ? "you" : booking.bookedBy.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
