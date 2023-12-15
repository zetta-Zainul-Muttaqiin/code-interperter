const { gql } = require('apollo-server-express');

// ********** will add field "task_follow_up_id : TaskFollowUp" after TaskFollowUp pushed, after sigantory
const historyReminderOfTaskFollowUpTypedef = gql`
  type HistoryTaskReminder {
    _id: ID
    date_sent: DueDateObject
    ref_id: String
    rncp_title_id: RncpTitle
    class_id: Class
    school_id: School
    due_date: DueDateObject
    percentage_task_after_send: Float
    template_reminder_id: TemplateReminder
    recipient: UserType
    recipient_in_cc: [UserType]
    signatory: User
    task_follow_up_id: TaskFollowUp
    send_condition: EnumOfSendCondition
    notif_sent: NotifySentType
    task_ids: [AcadTask]
    academic_director_id: User
    task_due_on_sent: Int
    count_document: Int
    task_done: Int
    total_task_transfered: Int
    transfered_task_ids: [AcadTask]
    total_task_closed: Int
    closed_task_ids: [AcadTask]
    notification_history_id: NotificationHistory
    status: String
  }

  input HistoryTaskReminderFilterInput {
    history_reminder_ids: [ID]
    notif_ref: String
    notif_name: String
    rncp_title: ID
    class: ID
    school: ID
    academic_director: String
    task_done: Int
    total_task_transfered: Int
    total_task_closed: Int
  }

  input HistoryTaskReminderSortingInput {
    date_sent: EnumSorting
    notif_ref: EnumSorting
    notif_name: EnumSorting
    rncp_title: EnumSorting
    class: EnumSorting
    school: EnumSorting
    due_date: EnumSorting
    academic_director: EnumSorting
    task_due_on_sent: EnumSorting
    task_done_after_send: EnumSorting
    task_done: EnumSorting
    total_task_transfered: EnumSorting
    total_task_closed: EnumSorting
  }

  input DateTimeInput {
    date: String
    time: String
  }

  input HistoryTaskReminderInput {
    date_sent: DateTimeInput
    ref_id: String
    rncp_title_id: ID
    class_id: ID
    school_id: ID
    due_date: DateTimeInput
    percentage_task_after_send: Float
    template_reminder_id: ID
    recipient: ID
    signatory: ID
    task_ids: [ID]
    academic_director_id: ID
    task_due_on_sent: Int
    task_done: Int
    total_task_transfered: Int
    transfered_task_ids: [ID]
    total_task_closed: Int
    closed_task_ids: [ID]
  }

  enum EnumOfSendCondition {
    immediately
    chosen_date
    recuring_reminder
  }

  type NotifySentType {
    subject: String
    body: String
  }

  extend type Query {
    GetAllHistoryTaskReminders(
      filter: HistoryTaskReminderFilterInput
      sorting: HistoryTaskReminderSortingInput
      pagination: PaginationInput
      lang: String
    ): [HistoryTaskReminder]
    GetAllReferenceReminderHistoryDropdown: [String]
    GetAllRncpTitleReminderHistoryDropdown: [RncpTitle]
    GetAllClassReminderHistoryDropdown: [Class]
    GetAllSchoolReminderHistoryDropdown: [School]
    GetAllTaskDoneHistoryDropdown: [Int]
    GetOneHistoryReminder(_id: ID): HistoryTaskReminder
    GetAllTaskTransferHistoryDropdown: [Int]
    GetAllTaskClosedHistoryDropdown: [Int]
    CheckTemplateIsAlreadySet(_id: ID): Boolean
  }

  extend type Mutation {
    ExportHistoryTaskReminderTable(
      lang: String!
      delimiter: String!
      file_name: String
      sorting: HistoryTaskReminderSortingInput
      filter: HistoryTaskReminderFilterInput
    ): String
    CreateHistoryReminder(history_task_reminder_input: [HistoryTaskReminderInput]): [HistoryTaskReminder]
    UpdateHistoryReminer(_id: ID, history_task_reminder_input: HistoryTaskReminderInput): HistoryTaskReminder
    DeleteHistoryReminder(_id: ID): HistoryTaskReminder
  }
`;

module.exports = historyReminderOfTaskFollowUpTypedef;
