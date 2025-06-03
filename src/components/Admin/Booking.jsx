import { useState, useRef, useEffect } from "react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { motion } from "framer-motion";
import { FiPlus, FiChevronLeft, FiChevronRight, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { useLocation } from "react-router-dom";

const BookingComponent = () => {
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0
  });
  const location = useLocation();



useEffect(() => {
  const fetchData = async () => {
    try {
      let apiUrl;
      if (location.pathname.startsWith('/admin')) {
        apiUrl = 'https://kong-7e283b39dauspilq0.kongcloud.dev/rental/rental_requests/?rental=2';
      } else {
        apiUrl = 'https://kong-7e283b39dauspilq0.kongcloud.dev/rental/rental_requests/?client=10';
      }

      const response = await fetch(apiUrl, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      const formattedEvents = data.map(item => ({
        id: item.id.toString(),
        title: `Equipment #${item.equipment}`,
        start: item.start_date,
        end: item.end_date,
        color: getStatusColor(item.status),
        textColor: '#ffffff',
        extendedProps: {
          client: item.client,
          status: item.status,
          equipment: item.equipment
        }
      }));

      const confirmedCount = data.filter(item => item.status === 'confirmed').length;
      const pendingCount = data.filter(item => item.status === 'pending').length;

      setStats({
        total: data.length,
        confirmed: confirmedCount,
        pending: pendingCount
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
}, [location.pathname]);
 // Add pathname as dependency to refetch if it changes

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#2EA099'; // Teal
      case 'pending':
        return '#F59E0B'; // Amber
      case 'cancelled':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();
    console.log('Event clicked:', info.event.title);
  };

  const handleDateClick = (arg) => {
    console.log('Date clicked:', arg.dateStr);
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
  };

  const changeView = (view) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(view);
    setCurrentView(view);
  };

  return (
    <div className="ml-64 p-6">
      <motion.div 
        className="bg-white rounded-xl shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <FiCalendar className="text-teal-600 text-xl" />
              <h2 className="text-xl font-semibold text-gray-800">Rental Schedule</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <motion.button 
                className="flex items-center px-3 py-1.5 text-sm rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-teal-500 hover:text-teal-600"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToday}
              >
                <span>Today</span>
              </motion.button>
              <motion.button 
                className="flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiPlus className="text-sm" />
                <span>New Booking</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-b border-gray-100">
          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <div className="bg-teal-100 p-3 rounded-full mr-4">
              <FiCalendar className="text-teal-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.total}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.confirmed}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <div className="bg-amber-100 p-3 rounded-full mr-4">
              <FiClock className="text-amber-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={currentView}
            initialDate={new Date()}
            headerToolbar={false}
            height="auto"
            aspectRatio={1.2}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={3}
            weekends={true}
            nowIndicator={true}
            dayHeaderClassNames="text-gray-600 font-medium text-xs"
            dayCellClassNames="hover:bg-gray-50 transition-colors"
            eventClassNames="rounded-lg border-0 shadow-xs"
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'short'
            }}
            views={{
              dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' },
                dayHeaderFormat: { weekday: 'short' },
                dayMaxEventRows: 2,
                eventMinHeight: 20,
                eventShortHeight: 20
              },
              timeGridWeek: {
                allDaySlot: false,
                slotMinTime: '08:00:00',
                slotMaxTime: '20:00:00',
                slotLabelFormat: { hour: '2-digit', minute: '2-digit', omitZeroMinute: true, meridiem: 'short' }
              },
              timeGridDay: {
                allDaySlot: false,
                slotMinTime: '08:00:00',
                slotMaxTime: '20:00:00',
                slotLabelFormat: { hour: '2-digit', minute: '2-digit', omitZeroMinute: true, meridiem: 'short' }
              },
              listWeek: {
                listDayFormat: { weekday: 'short', month: 'short', day: 'numeric' },
                listDaySideFormat: false
              }
            }}
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            eventContent={(eventInfo) => (
              <motion.div 
                className="p-1 h-full flex flex-col justify-between"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between items-start">
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate">{eventInfo.event.title}</div>
                    {eventInfo.timeText && (
                      <div className="text-[10px] opacity-80 mt-0.5 truncate">
                        {eventInfo.timeText}
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] uppercase tracking-wide bg-white bg-opacity-20 px-1 py-0.5 rounded">
                    {eventInfo.event.extendedProps.status}
                  </span>
                </div>
                <div className="text-[10px] opacity-90 truncate">
                  Client: {eventInfo.event.extendedProps.client.substring(0, 6)}...
                </div>
              </motion.div>
            )}
            dayHeaderContent={(args) => (
              <div className="text-xs font-medium text-gray-600 py-1">
                {args.text}
              </div>
            )}
          />
        </div>

        <div className="p-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex space-x-2">
            <motion.button 
              className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-teal-500 hover:text-teal-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
            >
              <FiChevronLeft className="text-sm" />
            </motion.button>
            <motion.button 
              className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-teal-500 hover:text-teal-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
            >
              <FiChevronRight className="text-sm" />
            </motion.button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <motion.button 
              className={`px-3 py-1 text-xs rounded-lg ${currentView === 'dayGridMonth' ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-500 hover:text-teal-600'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => changeView('dayGridMonth')}
            >
              Month
            </motion.button>
            <motion.button 
              className={`px-3 py-1 text-xs rounded-lg ${currentView === 'timeGridWeek' ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-500 hover:text-teal-600'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => changeView('timeGridWeek')}
            >
              Week
            </motion.button>
            <motion.button 
              className={`px-3 py-1 text-xs rounded-lg ${currentView === 'timeGridDay' ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-500 hover:text-teal-600'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => changeView('timeGridDay')}
            >
              Day
            </motion.button>
            <motion.button 
              className={`px-3 py-1 text-xs rounded-lg ${currentView === 'listWeek' ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-500 hover:text-teal-600'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => changeView('listWeek')}
            >
              List
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingComponent;