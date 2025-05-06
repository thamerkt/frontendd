import { useState, useRef } from "react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { motion } from "framer-motion";
import { FiPlus, FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";

const BookingComponent = () => {
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');

  const events = [
    { 
      title: 'Camera Rental', 
      start: new Date(),
      end: new Date(new Date().setDate(new Date().getDate() + 2)),
      color: '#2EA099',
      textColor: '#ffffff',
      extendedProps: {
        customer: 'John Smith',
        type: 'rental',
        status: 'confirmed'
      }
    },
    { 
      title: 'Equipment Return', 
      start: new Date(new Date().setDate(new Date().getDate() + 5)),
      end: new Date(new Date().setDate(new Date().getDate() + 5)),
      color: '#EF4444',
      textColor: '#ffffff',
      extendedProps: {
        customer: 'Sarah Johnson',
        type: 'return',
        status: 'completed'
      }
    },
    { 
      title: 'Maintenance', 
      start: new Date(new Date().setDate(new Date().getDate() + 10)),
      end: new Date(new Date().setDate(new Date().getDate() + 11)),
      color: '#F59E0B',
      textColor: '#ffffff',
      extendedProps: {
        customer: 'Mike Williams',
        type: 'maintenance',
        status: 'scheduled'
      }
    }
  ];

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
    <div className="ml-64 p-6"> {/* Added ml-64 to account for sidebar width */}
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
                  {eventInfo.event.extendedProps.status === 'confirmed' && (
                    <span className="text-[8px] uppercase tracking-wide bg-white bg-opacity-20 px-1 py-0.5 rounded">
                      Confirmed
                    </span>
                  )}
                </div>
                <div className="text-[10px] opacity-90 truncate">
                  {eventInfo.event.extendedProps.customer}
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