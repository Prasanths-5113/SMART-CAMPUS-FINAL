import type { StudentPersona } from '../types';

export const PERSONAS: StudentPersona[] = [
  {
    id: 'arjun',
    name: 'Arjun',
    department: 'CSE',
    year: '2nd Year',
    attendance: 82,
    preferences: {
      transport: 'College Bus',
      accessibility: 'No preference',
      notification: 'Important only',
    },
    timetableToday: [
      { subject: 'Database Management Systems', code: 'DBMS', time: '10:00 AM', venue: 'Block A – Room 201', hasAssignmentDue: true },
      { subject: 'Operating Systems', code: 'OS', time: '12:00 PM', venue: 'Block B – Room 105' },
      { subject: 'Data Structures Lab', code: 'DSL', time: '2:00 PM', venue: 'Block C – Lab 3' },
    ],
  },
  {
    id: 'priya',
    name: 'Priya',
    department: 'CSE',
    year: '3rd Year',
    attendance: 74,
    preferences: {
      transport: 'College Bus',
      accessibility: 'Elevator preferred',
      notification: 'Important only',
    },
    timetableToday: [
      { subject: 'Database Management Systems', code: 'DBMS', time: '10:00 AM', venue: 'Block B – Room 302', hasAssignmentDue: true },
      { subject: 'Software Engineering', code: 'SE', time: '11:00 AM', venue: 'Block B – Room 302' },
      { subject: 'Machine Learning', code: 'ML', time: '3:00 PM', venue: 'Block A – Lab 1' },
    ],
  },
];

export function getPersona(id: string): StudentPersona {
  return PERSONAS.find(p => p.id === id) ?? PERSONAS[0];
}
