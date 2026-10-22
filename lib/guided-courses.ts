import security from '../content/security/course.json' with { type: 'json' };
import helpdesk from '../content/helpdesk/course.json' with { type: 'json' };
import maintenance from '../content/azure/maintenance.json' with { type: 'json' };
import {
  nessusCourses,
  nessusLessons,
  type NessusCourse,
} from './nessus-curriculum.ts';
export const maintenanceCourse = maintenance as NessusCourse;
export const helpdeskCourse = helpdesk as NessusCourse;
export const securityCourse = security as NessusCourse;
export const guidedCourses = [...nessusCourses, maintenanceCourse, helpdeskCourse, securityCourse];
export const guidedLessons = [...nessusLessons, ...maintenanceCourse.lessons, ...helpdeskCourse.lessons, ...securityCourse.lessons];
export const guidedCourseHref = (id: string) =>
  id === 'budget-cloud-security' ? '/security' : id === 'iis-helpdesk' ? '/helpdesk' : id === 'azure-maintenance'
    ? '/azure-operations'
    : `/nessus/${id.replace('nessus-', '')}`;
