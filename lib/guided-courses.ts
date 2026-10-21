import maintenance from '../content/azure/maintenance.json' with { type: 'json' };
import {
  nessusCourses,
  nessusLessons,
  type NessusCourse,
} from './nessus-curriculum.ts';
export const maintenanceCourse = maintenance as NessusCourse;
export const guidedCourses = [...nessusCourses, maintenanceCourse];
export const guidedLessons = [...nessusLessons, ...maintenanceCourse.lessons];
export const guidedCourseHref = (id: string) =>
  id === 'azure-maintenance'
    ? '/azure-operations'
    : `/nessus/${id.replace('nessus-', '')}`;
