# TODO

## Job Creation Form Mandatory Fields + Validation
- [ ] Add required fields to the JobsPage job form model/state and UI inputs:
  - Job Title, Job Category, Employment Type, Work Mode, Location, Experience Required, Salary Range, Key Responsibilities, Required Skills, Educational Qualifications, Number of Openings, Application Deadline.
- [ ] Implement real-time field-level validation (on change / on blur) for each mandatory field.
- [ ] Implement pre-submission validation guard to block publish/add when any required field is missing/invalid.
- [ ] Add clear error messages and field-level guidance/placeholder text.
- [ ] Highlight missing/incomplete sections.
- [ ] Disable Publish/Add button until all mandatory requirements are satisfied.
- [x] Update types (recruiter/src/types/index.ts) and seed data/migrations if needed.

- [ ] Ensure existing add/update flows still work with new fields.
- [ ] Run typecheck/lint/build to verify.

