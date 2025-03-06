import { useState } from "react";
import React from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react'
const BookingComponent=()=>{

    return(

<div className="bg-white p-5 shadow-md rounded-lg w-full ">
                        <h2 className="text-xl font-semibold">Calendar</h2>
                        <div className="mt-5 w-full">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                                initialView="dayGridMonth" // Default view (Month view)
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listYear', // Views you want to enable
                                }}
                                views={{
                                    dayGridMonth: {
                                        // Custom configuration for month view if needed
                                        titleFormat: { year: 'numeric', month: 'short' }, // Show year and short month in title
                                    },
                                    timeGridWeek: {
                                        // Custom configuration for week view if needed
                                    },
                                    timeGridDay: {
                                        // Custom configuration for day view if needed
                                    },
                                    listYear: {
                                        // Custom configuration for year view if needed
                                    }
                                }}
                                events={[
                                    { title: 'Event 1', date: '2025-03-05' },
                                    { title: 'Event 2', date: '2025-03-10' }
                                ]}
                            />
                        </div>
                    </div>
                     )
                    }
               
export default BookingComponent;