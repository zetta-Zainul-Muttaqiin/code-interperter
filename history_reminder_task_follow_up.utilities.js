const common = require('../../utils/common');
const { isEmpty } = require('lodash');
const mongoose = require('mongoose');
const UserModel = require('../users/user.model');
const TemplateReminderModel = require('../templateReminderTaskFollowUp/template_reminder.model');
const HistoryReminderModel = require('./history_reminder_task_follow_up.model');
const RncpTitleModel = require('../rncpTitles/rncp_title.model');
const ClassModel = require('../classes/class.model');
const SchoolModel = require('../schools/school.model');
const S3Controller = require('../../services/file_upload/aws');
const AcadTaskModel = require('../acadTasks/models/acad_task.model');
const fs = require('fs');
const emailTemplates = require('../../utils/email/templates/index');
const emailUtil = require('../../utils/email');
const { CalculateTaskDonePercentage } = require('../taskFollowUp/task_follow_up.utilities');

// *************** function to generate query the history of task reminder
async function GenerateAggreateQueryGetAllHistoryTaskReminder({ filter, sorting, pagination, lang }) {
  const queryAggregate = [];

  const queryFilter = {
    $and: [],
  };

  let sort = {};

  if (filter) {
    if (filter.template_reminder_ids && filter.template_reminder_ids.length) {
      const templateReminderIds = filter.template_reminder_ids.map((templateReminder) => mongoose.Types.ObjectId(templateReminder));
      queryFilter.$and.push({ _id: { $in: templateReminderIds } });
    }
    if (filter.notif_ref) {
      queryFilter.$and.push({ ref_id: filter.notif_ref });
    }

    if (filter.notif_name) {
      const regexPattern = new RegExp(common.simpleDiacriticSensitiveRegex(filter.notif_name.replace('.', '').trim()), 'i');
      const notifIds = await TemplateReminderModel.find(
        {
          name: { $regex: regexPattern },
        },
        { _id: 1 }
      ).lean();

      const templateReminderIds = notifIds.map((notif) => notif._id);

      queryFilter.$and.push({
        template_reminder_id: { $in: templateReminderIds },
      });
    }

    if (filter.history_reminder_ids && filter.history_reminder_ids.length) {
      queryFilter.$and.push({ _id: { $in: filter.history_reminder_ids.map((id) => mongoose.Types.ObjectId(id)) } });
    }

    if (filter.rncp_title) {
      queryFilter.$and.push({
        rncp_title_id: mongoose.Types.ObjectId(filter.rncp_title),
      });
    }

    if (filter.class) {
      queryFilter.$and.push({
        class_id: mongoose.Types.ObjectId(filter.class),
      });
    }

    if (filter.school) {
      queryFilter.$and.push({
        school_id: mongoose.Types.ObjectId(filter.school),
      });
    }

    if (filter.academic_director) {
      const regexPattern = new RegExp(common.simpleDiacriticSensitiveRegex(filter.academic_director.replace('.', '').trim()), 'i');

      const userData = await UserModel.aggregate([
        {
          $match: {
            last_name: {
              $regex: regexPattern,
            },
          },
        },
        {
          $project: { _id: 1 },
        },
      ]).allowDiskUse(true);

      queryFilter.$and.push({
        academic_director_id: { $in: userData.map((eachUser) => mongoose.Types.ObjectId(eachUser._id)) },
      });
    }

    if (filter.total_task_transfered || filter.total_task_transfered === 0) {
      queryFilter.$and.push({
        total_task_transfered: filter.total_task_transfered,
      });
    }

    if (filter.task_done || filter.task_done === 0) {
      queryFilter.$and.push({
        task_done: filter.task_done,
      });
    }

    if (filter.total_task_closed || filter.total_task_closed === 0) {
      queryFilter.$and.push({
        total_task_closed: filter.total_task_closed,
      });
    }

    if (queryFilter.$and && queryFilter.$and.length) {
      queryAggregate.push({
        $match: { ...queryFilter },
      });
    }
  }

  // *************** sorting the fields
  if (sorting && sorting.notif_name) {
    queryAggregate.push({
      $lookup: {
        from: 'template_reminders',
        localField: 'template_reminder_id',
        foreignField: '_id',
        as: 'template_reminder_populate',
      },
    });

    queryAggregate.push({
      $addFields: {
        notif_name: { $arrayElemAt: ['$template_reminder_populate.name', 0] },
      },
    });
  }

  if (sorting && sorting.rncp_title) {
    queryAggregate.push({
      $lookup: {
        from: 'rncp_titles',
        localField: 'rncp_title_id',
        foreignField: '_id',
        as: 'rncp_title_populate',
      },
    });

    queryAggregate.push({
      $addFields: {
        rncp_title: { $arrayElemAt: ['$rncp_title_populate.short_name', 0] },
      },
    });
  }

  if (sorting && sorting.class) {
    queryAggregate.push({
      $lookup: {
        from: 'classes',
        localField: 'class_id',
        foreignField: '_id',
        as: 'class_populate',
      },
    });

    queryAggregate.push({
      $addFields: {
        class_name: { $arrayElemAt: ['$class_populate.name', 0] },
      },
    });
  }

  if (sorting && sorting.school) {
    queryAggregate.push({
      $lookup: {
        from: 'schools',
        localField: 'school_id',
        foreignField: '_id',
        as: 'school_populate',
      },
    });

    queryAggregate.push({
      $addFields: {
        school_name: { $arrayElemAt: ['$school_populate.short_name', 0] },
      },
    });
  }

  if (sorting && sorting.academic_director) {
    queryAggregate.push({
      $lookup: {
        from: 'users',
        localField: 'academic_director_id',
        foreignField: '_id',
        as: 'academic_director_populate',
      },
    });

    queryAggregate.push({
      $addFields: {
        translatedCivility: {
          $cond: {
            if: { $eq: [{ $toLower: '$civility' }, 'mr'] },
            then: lang === 'fr' ? 'M' : 'Mr',
            else: {
              $cond: {
                if: { $eq: [{ $toLower: '$civility' }, 'mrs'] },
                then: lang === 'fr' ? 'Mme' : 'Mrs',
                else: '',
              },
            },
          },
        },
      },
    });

    queryAggregate.push({
      $addFields: {
        academic_director: {
          $trim: {
            input: {
              $concat: [
                { $trim: { input: { $arrayElemAt: ['$academic_director_populate.last_name', 0] } } },
                ' ',
                { $trim: { input: { $arrayElemAt: ['$academic_director_populate.first_name', 0] } } },
                ' ',
                '$translatedCivility',
              ],
            },
          },
        },
      },
    });
  }

  if (sorting) {
    if (sorting.date_sent) {
      sort = { ...sort, date_sent: sorting.date_sent === 'asc' ? 1 : -1 };
    }

    if (sorting.notif_ref) {
      sort = { ...sort, ref_id: sorting.notif_ref === 'asc' ? 1 : -1 };
    }

    if (sorting.notif_name) {
      sort = { ...sort, notif_name: sorting.notif_name === 'asc' ? 1 : -1 };
    }

    if (sorting.rncp_title) {
      sort = { ...sort, rncp_title: sorting.rncp_title === 'asc' ? 1 : -1 };
    }

    if (sorting.class) {
      sort = { ...sort, class_name: sorting.class === 'asc' ? 1 : -1 };
    }

    if (sorting.school) {
      sort = { ...sort, school_name: sorting.school === 'asc' ? 1 : -1 };
    }

    if (sorting.due_date) {
      sort = { ...sort, due_date: sorting.due_date === 'asc' ? 1 : -1 };
    }

    if (sorting.task_done_after_send) {
      sort = { ...sort, percentage_task_after_send: sorting.task_done_after_send === 'asc' ? 1 : -1 };
    }

    if (sorting.academic_director) {
      sort = { ...sort, academic_director: sorting.academic_director === 'asc' ? 1 : -1 };
    }

    if (sorting.task_due_on_sent) {
      sort = { ...sort, task_due_on_sent: sorting.task_due_on_sent === 'asc' ? 1 : -1 };
    }

    if (sorting.task_done) {
      sort = { ...sort, task_done: sorting.task_done === 'asc' ? 1 : -1 };
    }

    if (sorting.total_task_transfered) {
      sort = { ...sort, total_task_transfered: sorting.total_task_transfered === 'asc' ? 1 : -1 };
    }

    if (sorting.total_task_closed) {
      sort = { ...sort, total_task_closed: sorting.total_task_closed === 'asc' ? 1 : -1 };
    }
  }

  queryAggregate.push({
    $sort: sort && !isEmpty(sort) ? sort : { updatedAt: -1 },
  });

  if (pagination) {
    queryAggregate.push({
      $facet: {
        data: [{ $skip: pagination.limit * pagination.page }, { $limit: pagination.limit }],
        countData: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    });
  }
  return queryAggregate;
}

/**
 * Purpose to construct CSV string, upload csv file and send notification contains link download csv file to user
 * @param {String} lang | string 'en' and 'fr'
 * @param {mongoose.ObjectID} user_id | mongoose.ObjectID
 * @param {string} delimiter | string
 * @param {string} file_name | string
 * @param {object} filter | object filter like in GetAllTaskFollowUp
 * @param {object} sorting | object sorting like in GetAllTaskFollowUp
 */
async function generateHistoryTaskReminderCSV({ lang = 'fr', user_id, delimiter, file_name, filter, sorting }) {
  const { getPlatformAdminUser } = require('../users/user.utilities');
  let finalDelimiter;
  if (delimiter === 'comma') {
    finalDelimiter = ',';
  } else if (delimiter === 'semicolon') {
    finalDelimiter = ';';
  } else if (delimiter === 'tab') {
    finalDelimiter = '\t';
  }

  let basicHeaders;
  if (lang === 'fr') {
    basicHeaders = [
      'Date',
      'Notif Ref',
      'Nom',
      'Titre',
      'Classe',
      'Ecole',
      'Référent Titre',
      'Date limite',
      "Tâche due lors de l'envoi",
      "% de tâches effectuées après l'envoi",
      'Fait',
      'Transfert',
      "Fermé à la date d'échéance",
    ];
  } else {
    basicHeaders = [
      'Date',
      'Notif Ref',
      'Name',
      'Title',
      'Class',
      'School',
      'Academic Director',
      'Due Date',
      'Task Due on Send',
      '% Task Done after Send',
      'Done',
      'Transfer',
      'Closed on due date',
    ];
  }

  let limit = 100;
  let loopPosition = 0;
  let isDone = false;
  let finalString = `${basicHeaders.join(finalDelimiter)}\n`;
  while (!isDone) {
    const aggregateQuery = await GenerateAggreateQueryGetAllHistoryTaskReminder({
      pagination: { limit, page: loopPosition },
      filter,
      sorting,
    });

    const historyTaskReminders = await HistoryReminderModel.aggregate(aggregateQuery).allowDiskUse(true);

    // ********************* sanity check
    if (historyTaskReminders && historyTaskReminders.length && historyTaskReminders[0].data && historyTaskReminders[0].data.length) {
      const historyTaskReminderData = historyTaskReminders[0].data;
      for (const historyTaskReminder of historyTaskReminderData) {
        finalString += `"${
          historyTaskReminder.date_sent && historyTaskReminder.date_sent.date ? historyTaskReminder.date_sent.date : ''
        }"${finalDelimiter}`;
        finalString += `"${historyTaskReminder.ref_id && historyTaskReminder.ref_id ? historyTaskReminder.ref_id : ''}"${finalDelimiter}`;
        const templateReminderData = await TemplateReminderModel.findById(historyTaskReminder.template_reminder_id).lean();
        const rncpTitleData = await RncpTitleModel.findById(historyTaskReminder.rncp_title_id).lean();
        const classData = await ClassModel.findById(historyTaskReminder.class_id).lean();
        const schoolData = await SchoolModel.findById(historyTaskReminder.school_id).lean();

        finalString += `"${templateReminderData && templateReminderData.name ? templateReminderData.name : ''}"${finalDelimiter}`;
        finalString += `"${rncpTitleData && rncpTitleData.short_name ? rncpTitleData.short_name : ''}"${finalDelimiter}`;
        finalString += `"${classData && classData.name ? classData.name : ''}"${finalDelimiter}`;
        finalString += `"${schoolData && schoolData.short_name ? schoolData.short_name : ''}"${finalDelimiter}`;

        const user = await UserModel.findById(historyTaskReminder.academic_director_id).lean();

        finalString += `"${user.last_name.toUpperCase()} ${user.first_name} ${emailUtil.computeCivility(user.sex, lang)}"${finalDelimiter}`;
        finalString += `"${
          historyTaskReminder.due_date && historyTaskReminder.due_date.date ? historyTaskReminder.due_date.date : ''
        }"${finalDelimiter}`;
        finalString +=
          historyTaskReminder.task_due_on_sent || historyTaskReminder.task_due_on_sent === 0
            ? `"${historyTaskReminder.task_due_on_sent}"${finalDelimiter}`
            : `${finalDelimiter}`;
        finalString +=
          historyTaskReminder.percentage_task_after_send || historyTaskReminder.percentage_task_after_send === 0
            ? `"${historyTaskReminder.percentage_task_after_send}%"${finalDelimiter}`
            : `${finalDelimiter}`;
        finalString +=
          historyTaskReminder.task_done || historyTaskReminder.task_done === 0
            ? `"${historyTaskReminder.task_done}"${finalDelimiter}`
            : `${finalDelimiter}`;
        finalString +=
          historyTaskReminder.total_task_transfered || historyTaskReminder.total_task_transfered === 0
            ? `"${historyTaskReminder.total_task_transfered}"${finalDelimiter}`
            : `${finalDelimiter}`;
        finalString +=
          historyTaskReminder.total_task_closed || historyTaskReminder.total_task_closed === 0
            ? `"${historyTaskReminder.total_task_closed}"${finalDelimiter}\n`
            : `${finalDelimiter}\n`;
      }
    }

    if (historyTaskReminders[0].data.length < limit) {
      isDone = true;
    }
    loopPosition++;
  }
  let UUID = common.create_UUID();
  file_name = `${file_name}-${UUID}.csv`;
  const actualFileName = `public/fileuploads/${file_name}`;

  fs.writeFileSync(actualFileName, finalString, { encoding: 'utf-8' });
  // *************** upload file to s3
  let file = {
    originalname: '',
    buffer: '',
  };
  file.buffer = fs.readFileSync(actualFileName);
  file.originalname = file_name;

  let fileObject = await S3Controller.uploadToS3(file);
  fs.unlinkSync(actualFileName);
  let attachments = [];
  attachments.push({
    filename: fileObject.fileName,
    path: `${process.env.API_BASE}/fileuploads/${fileObject.fileName}`,
  });

  const loggedInUser = await UserModel.findById(user_id).lean();
  const platformUser = await getPlatformAdminUser();
  const mailOptions = Object.assign({}, emailTemplates.EXPORT_N1);
  const url = `${process.env.API_BASE}/fileuploads/${fileObject.fileName}?download=true`;
  const tableNameExported = lang === 'fr' ? 'Historique du tableau de rappel' : 'History Of Reminder Table';
  mailOptions.subjectEN = `Your export is ready,  This is your export file from ${tableNameExported}`;
  mailOptions.subjectFR = `Votre export est prêt, Ceci est votre fichier d'export depuis ${tableNameExported}`;

  mailOptions.language = lang;
  mailOptions.notificationReference = 'EXPORT_N1';
  mailOptions.requiredParams = {
    tableNameExported,
    UserWhoReceivedCivility: emailUtil.computeCivility(loggedInUser.sex, lang),
    UserWhoReceivedFirstName: loggedInUser.first_name,
    UserWhoReceivedLastName: loggedInUser.last_name,
    url,
    NotifRef: mailOptions.notificationReference,
  };
  mailOptions.is_notification_template = false;
  mailOptions.sendToPersonalEmail = true;
  mailOptions.sendToPlatformMailBox = true;
  mailOptions.to = loggedInUser.email;
  mailOptions.toId = loggedInUser._id;
  mailOptions.from = platformUser.email;
  mailOptions.fromId = platformUser._id;
  mailOptions.fileAttachments = attachments;

  emailUtil.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

/**
 * This function is tu count and update transfered task in history reminder
 * @param {Array} transfered_task_ids array of id task that still todo and need to transfer
 * @param {mongoose.Tyoes.ObjectId} acadir_user_id id of acadir
 * @param {mongoose.Tyoes.ObjectId} school_id id of school
 * @param {mongoose.Tyoes.ObjectId} rncp_title_id id fo rncp title
 * @param {mongoose.Tyoes.ObjectId} class_id id of class
 */
async function CountTransferedTask(transfered_task_ids, acadir_user_id, school_id, rncp_title_id, class_id) {
  const reminderHistories = await HistoryReminderModel.find({
    academic_director_id: acadir_user_id,
    school_id: school_id,
    class_id: class_id,
    rncp_title_id: rncp_title_id,
  }).lean();

  if (reminderHistories && reminderHistories.length) {
    for (const reminderHistory of reminderHistories) {
      // *************** Move all task id from previous acad dir history task id into field transferd_task_ids
      if (reminderHistory && reminderHistory.task_ids && reminderHistory.task_ids.length) {
        
        const remainingDoneTasks = await AcadTaskModel.distinct('_id', {_id: { $in : reminderHistory.task_ids }, task_status: 'done'});
        const remainingTodoTasks = await AcadTaskModel.distinct('_id', {_id: { $in : reminderHistory.task_ids }, task_status: 'todo'});
        
        // *************** Save task ids into each field
        await HistoryReminderModel.findByIdAndUpdate(reminderHistory._id, {
          $set: {
            task_ids: remainingDoneTasks,
            transfered_task_ids: remainingTodoTasks,
            total_task_transfered:remainingTodoTasks.length,
          },
        }).lean();
      }
      const taskUpdated = await CalculateTaskDonePercentage(reminderHistory._id);
      await HistoryReminderModel.findByIdAndUpdate(reminderHistory._id, {
        $set: { percentage_task_after_send: taskUpdated.percentage, task_done: taskUpdated.task_done },
      });
    }
  }
}

module.exports = {
  GenerateAggreateQueryGetAllHistoryTaskReminder,
  generateHistoryTaskReminderCSV,
  CountTransferedTask,
};
