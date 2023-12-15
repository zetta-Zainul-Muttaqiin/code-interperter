import { Component, ViewChild, OnInit, OnDestroy, ViewChildren, QueryList, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import * as _ from 'lodash';
import { UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { SendMailDialogComponent } from '../send-mail-dialog/send-mail-dialog.component';
import { MailToGroupDialogComponent } from '../mail-to-group-dialog/mail-to-group-dialog.component';
import { debounceTime, startWith, tap, map } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';
import { HttpClient } from '@angular/common/http';
import { UrgentMessageDialogComponent } from 'app/urgent-message/urgent-message-dialog.component';
import { ReplyUrgentMessageDialogComponent } from '../reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { NgxPermissionsService } from 'ngx-permissions';
import { CertificationRuleService } from 'app/service/certification-rule/certification-rule.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { PermissionService } from 'app/service/permission/permission.service';
import Swal from 'sweetalert2';
import { FilterBreadCrumbItem, FilterBreadCrumbInput } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'ms-cc',
  templateUrl: '../mailbox/mailbox.component.html',
  styleUrls: ['../mailbox/mailbox.component.scss'],
})
export class CcComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() isTeacherCard: Boolean = false;
  @Input() userId: string;
  inbox = false;
  cc = true;
  important = false;
  draft = false;
  trash = false;
  sent = false;
  isWaitingForResponse = false;
  IsReplyBtn = false;
  IsReplyAllBtn = false;
  IsForwardBtn = false;
  IsDeleteBtn = false;
  IsImportantBtn = false;
  IsMovetoInboxBtn = false;
  hideResetButton = false;
  alreadyRead = false;
  noData: any;

  isSearching = false;
  selectedMails = [];
  @ViewChildren('checkBox') checkBox: QueryList<any>;

  mailCategories;
  mailList = [];
  mailSelected = [];
  rank: string;
  checked = [];
  countSelected: boolean;
  isChecked = false;
  selection = new SelectionModel(true, []);
  sendMailDialogComponent: MatDialogRef<SendMailDialogComponent>;
  urgentMessageDialogComponent: MatDialogRef<UrgentMessageDialogComponent>;
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  mailToGroupDialogComponent: MatDialogRef<MailToGroupDialogComponent>;
  config: MatDialogConfig = {
    disableClose: true,
    width: '800px',
  };
  urgentMessageConfig: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };
  configCertificatioRule: MatDialogConfig = {
    disableClose: true,
  };
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['select', 'created_at', 'timeTable', 'from', 'to', 'subject'];
  filterColumns: string[] = ['selectFilter', 'createdAtFilter', 'timeTableFilter', 'fromFilter', 'toFilter', 'subjectFilter'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private subs = new SubSink();

  isReset = false;
  inboxCount = 0;
  ccCount = 0;
  importantCount = 0;
  senderId: string;
  senderName: string;
  senderEmail: string;
  userIdList: string;

  recipientId: string;
  receipientName: string;
  receipientEmail: string;
  subject: string;
  filterSubject: string;
  filterFrom: string;
  message: string;
  messageDate: string;

  dataLoaded = false;
  viewBcc = false;
  sortEmail = 'asc';
  sortFrom = 'asc';
  sortTo = 'asc';
  sortStatus = 'asc';
  dataCount: number;
  sortValue: any;

  /*Searching and filter*/
  dateFilter = new UntypedFormControl('');
  fromFilter = new UntypedFormControl('');
  toFilter = new UntypedFormControl('');
  subjectFilter = new UntypedFormControl('');
  lightningFilter = new UntypedFormControl('');
  titleFilterList = [];
  titleName: any;
  typeName: any;
  isWaitRecipientGroup = false;
  filterBreadcrumbData: any[] = [];

  filteredValues = {
    date: '',
    from: '',
    to: '',
    subject: '',
  };

  filteredValuesDate = {
    date: '',
  };

  isOPERATORDir = false;
  isOPERATORAdmin = false;

  mailsList = [];
  getCountOfCC = [];
  recpList = [];
  ccList = [];
  bccList = [];
  viewMessageData: any;
  dataId: any;
  currentUser: any;
  selectedMailCategory = 'cc';
  private timeOutVal: any;
  selectedRncpTitleLongName: any;
  selectedRncpTitleName: any;
  datePipe: any;
  constructor(
    private mailboxService: MailboxService,
    private userService: AuthService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private permissions: NgxPermissionsService,
    private certificationRuleService: CertificationRuleService,
    private rncpTitlesService: RNCPTitlesService,
    public permissionService: PermissionService,
    private dateAdapter: DateAdapter<Date>,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.dateAdapter.setLocale(this.translate.currentLang);
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.dateAdapter.setLocale(this.translate.currentLang);
    });
    this.currentUser = this.userService.getLocalStorageUser();
    this.isOPERATORAdmin = !!this.permissions.getPermission('operator_admin');
    this.isOPERATORDir = !!this.permissions.getPermission('operator_dir');
    this.countSelected = false;
    this.sortValue = { latest_email: 'asc' };
    this.getMailbox();
    if (!!this.permissions.getPermission('Student')) {
      this.getCertificationRule();
    }
    this.initMail();
    if(!this.isTeacherCard){
      this.pageTitleService.setTitle('CC');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.userId) {
      this.resetFilter();
    }
  }

  getMailbox() {
    this.isWaitingForResponse = true;
    const type = 'inbox';
    const recipientRank = 'cc_bcc';
    const new_mail = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex,
    };
    const filter = this.cleanFilterData();
    this.userId = this.userId ? this.userId : this.currentUser?._id;
    this.getMainMailBox(pagination, this.sortValue, type, new_mail, filter, recipientRank, this.userId);
  }

  getMainMailBox(pagination, sortvalue, type, new_mail, filter, recipientRank, userId?) {
    const user = userId ? userId : null;
    this.subs.sink = this.mailboxService.getMainMail(pagination, sortvalue, type, new_mail, filter, recipientRank, user).subscribe(
      (mailList: any[]) => {
        this.isReset = false;
        this.isWaitingForResponse = false;
        if (mailList && mailList.length > 0) {
          mailList.forEach((mail, index) => {
            mail.recipient_properties.forEach((recip) => {
              recip.recipients.forEach((recipients) => {
                if (recipients.email === this.currentUser.email) {
                  if (recip.is_read === true) {
                    mail['is_already_read'] = true;
                  } else {
                    mail['is_already_read'] = false;
                  }
                }
              });
            });
          });

          this.dataSource.data = mailList;
          this.dataSource.sort = this.sort;
          this.mailList = mailList;
          this.ccCount = mailList[0] ? mailList[0].count_not_read : 0;
          this.paginator.length = mailList[0] ? mailList[0].count_document : 0;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.isWaitingForResponse = false;
        }
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      },
      (err) => {
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data ? this.dataSource.data.length : null;
    const data = this.selection.selected;
    this.mailSelected = [];
    data.forEach((mail) => {
      this.mailSelected.push(mail._id);
    });
    return numSelected === numRows;
  }

  getFileName(fileName: String): string {
    if (fileName) {
      return fileName.substring(fileName.lastIndexOf('/') + 1);
    }
    return '';
  }

  downloadFile(file) {
    // console.log(file);
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = file.path;
    a.download = file.file_name;
    a.click();
    a.remove();
  }

  getRecipientFullName(recipient_propertiess) {
    const recipient_properties = recipient_propertiess;
    let recip: any;
    if (recipient_properties) {
      recip = recipient_properties.filter((rec) => rec.recipients[0].email === this.currentUser.email);
      if (recip && recip.length) {
        const senderObj = recip[0];
        return senderObj;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
  initMail() {
    this.subs.sink = this.dateFilter.valueChanges.subscribe((date) => {
      const newDate = moment(date).format('DD/MM/YYYY');
      this.filteredValues.date = date;
      this.filteredValuesDate.date = date ? newDate : null;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getMailbox();
      }
    });

    this.subs.sink = this.fromFilter.valueChanges.pipe(debounceTime(400)).subscribe((value) => {
      if (this.fromFilter.value !== '') {
        const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
        const symbol1 = /\\/;
        if (!value.match(symbol) && !value.match(symbol1)) {
          this.filteredValues.from = value ? value : '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getMailbox();
          }
        } else {
          const dataReplace = value.replace(symbol, '');
          this.fromFilter.setValue(dataReplace);
        }
      } else {
        this.filteredValues.from = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getMailbox();
        }
      }
    });

    this.subs.sink = this.toFilter.valueChanges.pipe(debounceTime(400)).subscribe((to) => {
      if (this.toFilter.value !== '') {
        const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
        const symbol1 = /\\/;
        if (!to.match(symbol) && !to.match(symbol1)) {
          this.filteredValues.to = to ? to : '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getMailbox();
          }
        } else {
          const dataReplace = to.replace(symbol, '');
          this.toFilter.setValue(dataReplace);
        }
      } else {
        this.filteredValues.to = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getMailbox();
        }
      }
    });

    this.subs.sink = this.subjectFilter.valueChanges.pipe(debounceTime(400)).subscribe((subject) => {
      if (this.subjectFilter.value !== '') {
        const symbol = /[()|{}\[\]:;<>?,+*$&#%^!\/]/g;
        const symbol1 = /\\/;
        if (!subject.match(symbol) && !subject.match(symbol1)) {
          this.filteredValues.subject = subject ? subject : '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getMailbox();
          }
        } else {
          const dataReplace = subject.replace(symbol, '');
          this.subjectFilter.setValue(dataReplace);
        }
      } else {
        this.filteredValues.subject = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getMailbox();
        }
      }
    });

    this.mailCategories = this.mailboxService.getMailCategories();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getMailbox();
      }
    }
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      if (filterData[key]) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return filterQuery;
  }

  sendMail() {
    this.sendMailDialogComponent = this.dialog.open(SendMailDialogComponent, this.config);
    this.subs.sink = this.sendMailDialogComponent.afterClosed().subscribe((result) => {
      if (!this.isReset) {
        this.getMailbox();
      }
      this.sendMailDialogComponent = null;
    });
  }

  sendUrgentMessage() {
    this.urgentMessageDialogComponent = this.dialog.open(UrgentMessageDialogComponent, this.urgentMessageConfig);
  }

  sendMailToGroup() {
    this.mailToGroupDialogComponent = this.dialog.open(MailToGroupDialogComponent, this.config);
  }

  resetFilter() {
    // set the View Message null for display off the view message when reset clicked
    // this.viewMessageData =null;
    this.isReset = true;
    this.filteredValues = {
      date: '',
      from: '',
      to: '',
      subject: '',
    };
    this.filteredValuesDate = {
      date: '',
    }
    this.filterBreadcrumbData = [];
    this.sort.direction = '';
    this.sort.active = '';
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = this.sortValue = { latest_email: 'asc' };
    this.dataSource.data = [];
    this.paginator.pageIndex = 0;
    this.dateFilter.setValue('');
    this.subjectFilter.setValue('');
    this.fromFilter.setValue('');
    this.toFilter.setValue('');
    this.selection.clear();
    this.getMailbox();
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
    this.dataSource.data = [];
    if(!this.isTeacherCard){
      this.pageTitleService.setTitle(null);
    }
  }

  changePage(event: any) {
    if (!this.isReset) {
      this.getMailbox();
    }
  }

  updateToReadFlag(_id: string, index?) {
    const mailData: any = _.cloneDeep(this.viewMessageData);
    delete mailData.$$index;
    delete mailData.is_already_read;

    let recipient_properties = {};
    let changeNeeded = false;
    const mailId = [];
    mailId.push(mailData._id);
    if (mailData.recipient_properties) {
      mailData.recipient_properties.forEach((recipient) => {
        recipient.recipients.forEach((mail) => {
          if (recipient.is_read === false && (mail.email === this.currentUser.email || mail.email === this.currentUser.email)) {
            mailData.recipient_properties[0].is_read = true;
            changeNeeded = true;
            recipient_properties = {
              is_read: true,
            };
            mailData.recipient_properties.recipients = [mail];
          }
        });
      });
    }

    if (changeNeeded) {
      if (index === 0 || index) {
        const tempData = _.cloneDeep(this.dataSource.data);
        if (tempData[index]) {
          tempData[index].is_already_read = true;
          this.dataSource.data = tempData;
        }
      }
      this.subs.sink = this.mailboxService.updateMultipleMailRecipient(mailId, recipient_properties).subscribe(
        (resp) => {
          if (!(index === 0 || index)) {
            if (!this.isReset) {
              this.getMailbox();
            }
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }

  // Select list to preview
  onSelectMessage(data, index: number) {
    this.viewMessageData = data;
    if (data.user_type_selection) {
      this.getRecipientName(data);
      this.isWaitRecipientGroup = true;
    } else {
      this.isWaitRecipientGroup = false;
    }
    this.viewBcc = false;
    this.recpList = [];
    this.ccList = [];
    this.bccList = [];
    this.getCountOfCC = data.recipient_properties;

    if (data.is_group_parent) {
      const recip = this.getRecipientFullName(data.recipient_properties);
      this.recpList.push(recip);
    } else {
      if (this.getCountOfCC && this.getCountOfCC.length) {
        this.getCountOfCC.forEach((element, indexx) => {
          if (element.rank !== null && element.rank !== undefined) {
            if (element.rank === 'a') {
              this.recpList.push(element);
            }

            if (element.rank === 'cc') {
              this.ccList.push(element);
              element.recipients.forEach((mail) => {
                if (element.rank === 'cc' && mail.email === this.currentUser.email) {
                  // this.viewBcc = true;
                }
              });
            }

            if (this.viewBcc) {
              if (element.rank === 'c') {
                this.bccList.push(element);
                // console.log('Ada BCC :', element);
              }
            }

            element.recipients.forEach((mail) => {
              if (element.rank === 'c' && mail.email === this.currentUser.email) {
                this.recpList.push(element);
              }
            });
          } else {
            data.recipient_properties[0].rank = 'a';
            this.recpList.push(data.recipient_properties[0]);
          }
        });
      }
    }
    // console.log('indeeex  ', index);
    this.viewMessageData['$$index'] = index;

    this.updateToReadFlag(data._id, index);
  }

  onPreviousMessage(data) {
    this.viewBcc = false;
    this.recpList = [];
    this.ccList = [];
    this.bccList = [];
    const currentIndex = this.viewMessageData['$$index'] - 1;
    // console.log('indeeexprevieus   ', currentIndex);
    this.viewMessageData = this.mailList[currentIndex];
    this.viewMessageData['$$index'] = currentIndex;

    this.getCountOfCC = this.mailList[currentIndex].recipient_properties;

    this.getCountOfCC.forEach((element, index) => {
      if (element.rank !== null && element.rank !== undefined) {
        if (element.rank === 'a') {
          this.recpList.push(element);
        }

        if (element.rank === 'cc') {
          this.ccList.push(element);
          element.recipients.forEach((mail) => {
            if (element.rank === 'cc' && mail.email === this.currentUser.email) {
              // this.viewBcc = true;
            }
          });
        }

        if (this.viewBcc) {
          if (element.rank === 'c') {
            this.bccList.push(element);
            // console.log('Ada BCC :', element);
          }
        }

        element.recipients.forEach((mail) => {
          if (element.rank === 'c' && mail.email === this.currentUser.email) {
            this.recpList.push(element);
          }
        });
      } else {
        data.recipient_properties[0].rank = 'a';
        this.recpList.push(data.recipient_properties[0]);
      }
    });

    // this.updateToReadFlag(this.viewMessageData['_id']);
  }
  onNextMessage(data) {
    if (this.viewMessageData && this.viewMessageData['$$index'] + 1 < this.mailList.length) {
      this.viewBcc = false;
      this.recpList = [];
      this.ccList = [];
      this.bccList = [];
      const currentIndex = this.viewMessageData['$$index'] + 1;
      this.viewMessageData = this.mailList[currentIndex];
      this.viewMessageData['$$index'] = currentIndex;
      // console.log('indeeex Nex ', currentIndex);
      // console.log('Update ', data);
      this.getCountOfCC = this.mailList[currentIndex].recipient_properties;

      this.getCountOfCC.forEach((element, index) => {
        if (element.rank !== null && element.rank !== undefined) {
          if (element.rank === 'a') {
            this.recpList.push(element);
          }

          if (element.rank === 'cc') {
            this.ccList.push(element);
            element.recipients.forEach((mail) => {
              if (element.rank === 'cc' && mail.email === this.currentUser.email) {
                // this.viewBcc = true;
              }
            });
          }

          if (this.viewBcc) {
            if (element.rank === 'c') {
              this.bccList.push(element);
              // console.log('Ada BCC :', element);
            }
          }

          element.recipients.forEach((mail) => {
            if (element.rank === 'c' && mail.email === this.currentUser.email) {
              this.recpList.push(element);
            }
          });
        } else {
          data.recipient_properties[0].rank = 'a';
          this.recpList.push(data.recipient_properties[0]);
        }
      });
      this.updateToReadFlag(this.viewMessageData['_id']);
    }
  }
  checkIsPreviousBtnShow() {
    const prevBtn = this.viewMessageData['$$index'] === 0 ? false : true;
    return prevBtn;
  }
  checkIsNextBtnShow() {
    return this.viewMessageData['$$index'] === this.mailList.length - 1 ? false : true;
  }

  OpenMailPopupRequest(data, tag) {
    // console.log('viewMessageData ', data);
    this.config.data = {};
    this.sendMailDialogComponent = this.dialog.open(SendMailDialogComponent, this.config);
    this.sendMailDialogComponent.componentInstance.tags = [tag];
    this.sendMailDialogComponent.componentInstance.currentMailData = data;
    if (this.selectedMailCategory === 'sent') {
      this.sendMailDialogComponent.componentInstance.isSenderReq = false;
    }

    this.subs.sink = this.sendMailDialogComponent.afterClosed().subscribe((result) => {
      if (result === 'updateMailList') {
        if (!this.isReset) {
          this.getMailbox();
        }
      }
      this.sendMailDialogComponent = null;
    });
  }

  // Open dialog when click event from delete button at preview message
  public openDialog(data) {
    let title = 'Are you sure?';
    let message = 'You are about to delete this message';
    if (this.translate.currentLang === 'fr') {
      title = 'tes-vous sr?';
      message = 'Vous allez supprimer ce message';
    }

    const recipient_properties = {
      mail_type: 'trash',
    };
    // const recipient_properties = {
    //   mail_type: 'trash',
    // };
    let timeDisabled = 3;
    swal
      .fire({
        title: this.translate.instant('MailBox.MESSAGES.ATTENTION'),
        text: this.translate.instant('MailBox.MESSAGES.ASKMSG'),
        type: 'warning',
        showCancelButton: true,
        allowEscapeKey: true,
        confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
        onOpen: () => {
          swal.disableConfirmButton();
          const confirmBtnRef = swal.getConfirmButton();
          const time = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + timeDisabled + ' sec';
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
            swal.enableConfirmButton();
            clearInterval(time);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      })
      .then((result) => {
        clearTimeout(this.timeOutVal);
        if (result.value) {
          this.viewMessageData = [];
          const ids = [];
          ids.push(data._id);
          this.subs.sink = this.mailboxService.updateMultipleMailRecipient(ids, recipient_properties).subscribe(
            (dataa: any) => {
              swal.fire({
                type: 'info',
                title: this.translate.instant('MailBox.MESSAGES.DELMSG'),
                text: '',
                confirmButtonText: this.translate.instant('MailBox.MESSAGES.THANK'),
              });
              if (!this.isReset) {
                this.getMailbox();
              }
            },
            (err) => {
              this.userService.postErrorLog(err);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        }
      });
  }

  // this function execute when we click to delete mail (Move to trash)
  onDeleteMail() {
    const recipient_properties = {
      mail_type: 'trash',
    };

    let title = 'Are you sure?';
    let message = 'You are about to delete this message';
    if (this.translate.currentLang === 'fr') {
      title = 'tes-vous sr?';
      message = 'Vous allez supprimer ce message';
    }
    let timeDisabled = 3;

    swal
      .fire({
        title: this.translate.instant('MailBox.MESSAGES.ATTENTION'),
        text: this.translate.instant('MailBox.MESSAGES.ASKMSG'),
        type: 'warning',
        showCancelButton: true,
        allowEscapeKey: true,
        confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
        onOpen: () => {
          swal.disableConfirmButton();
          const confirmBtnRef = swal.getConfirmButton();
          const time = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + timeDisabled + ' sec';
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
            swal.enableConfirmButton();
            clearInterval(time);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      })
      .then((result) => {
        clearTimeout(this.timeOutVal);
        if (result.value) {
          this.viewMessageData = [];
          this.subs.sink = this.mailboxService.updateMultipleMailRecipient(this.mailSelected, recipient_properties).subscribe(
            (data: any) => {
              swal.fire({
                type: 'info',
                title: this.translate.instant('MailBox.MESSAGES.DELMSG'),
                text: '',
                confirmButtonText: this.translate.instant('MailBox.MESSAGES.THANK'),
              });
              if (!this.isReset) {
                this.getMailbox();
              }
            },
            (err) => {
              this.userService.postErrorLog(err);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        }
      });
  }

  receiveEmail() {
    if (!this.isReset) {
      this.getMailbox();
    }
  }

  // Update move inbox to important
  mailMoveTo(mail_type) {
    const recipient_properties = {
      mail_type: mail_type,
    };
    this.viewMessageData = [];
    this.subs.sink = this.mailboxService.updateMultipleMailRecipient(this.mailSelected, recipient_properties).subscribe(
      (data: any) => {
        if (!this.isReset) {
          this.getMailbox();
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  showOptions() {
    const numSelected = this.selection.selected.length;
    if (numSelected > 0) {
      this.countSelected = true;
    } else {
      this.countSelected = false;
    }
  }

  getMessage(data) {
    if (data) {
      if (data && data.includes('<table>')) {
        data = data.replaceAll('<table>', '<table class="notif-table full-width" border="1">');
      }
      if (data && data.includes('<a')) {
        if (data && !data.includes('target')) {
          data = data.replaceAll('<a', '<a target="blank" class="blue-link-format"');
        }
      }
      // console.log('formattedData', data);
      return data;
    } else {
      return '';
    }
  }

  getUrgentMail() {
    this.subs.sink = this.mailboxService.getUrgentMail().subscribe(
      (mailList: any[]) => {
        if (mailList && mailList.length) {
          this.subs.sink = this.dialog
            .open(ReplyUrgentMessageDialogComponent, {
              disableClose: true,
              width: '825px',
              panelClass: 'certification-rule-pop-up',
              data: mailList,
            })
            .afterClosed()
            .subscribe((resp) => {
              this.subs.sink = this.mailboxService.getUrgentMail().subscribe(
                (mailUrgent: any[]) => {
                  if (mailUrgent && mailUrgent.length) {
                    this.replyUrgentMessageDialogComponent = this.dialog.open(ReplyUrgentMessageDialogComponent, {
                      disableClose: true,
                      width: '825px',
                      panelClass: 'certification-rule-pop-up',
                      data: mailUrgent,
                    });
                  }
                },
                (err) => {
                  this.userService.postErrorLog(err);
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('SORRY'),
                    text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                    confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                  });
                },
              );
            });
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getCertificationRule() {
    const studentData = this.userService.getLocalStorageUser();
    const titleId = studentData.entities[0].assigned_rncp_title._id;
    const classId = studentData.entities[0].class._id;
    const studentId = studentData._id;
    this.subs.sink = this.rncpTitlesService.getRncpTitleById(titleId).subscribe((resp) => {
      this.selectedRncpTitleName = resp.short_name;
      this.selectedRncpTitleLongName = resp.long_name;
    });
    this.subs.sink = this.certificationRuleService.getCertificationRuleSentWithStudent(titleId, classId, studentId).subscribe(
      (dataRule: any) => {
        if (dataRule) {
          // this.showCertificationRule(titleId, classId);
        } else {
          this.getUrgentMail();
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getRecipientName(data) {
    // console.log('This group recipient : ', data);
    if (data.group_detail.rncp_titles && data.group_detail.rncp_titles.length) {
      this.subs.sink = this.mailboxService.getOneTitle(data.group_detail.rncp_titles[0]._id).subscribe(
        (resp) => {
          if (resp) {
            this.titleName = resp.short_name;
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
    if (data.group_detail.user_types && data.group_detail.user_types.length) {
      this.subs.sink = this.mailboxService.getOneUserTypes(data.group_detail.user_types[0]._id).subscribe(
        (respp) => {
          if (respp) {
            this.typeName = respp.name;
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
    this.isWaitRecipientGroup = false;
  }

  showCertificationRule(selectedRncpTitleId, selectedClassId) {
    // this.dialog
    //   .open(CertificationRulePopUpComponent, {
    //     panelClass: 'reply-message-pop-up',
    //     ...this.configCertificatioRule,
    //     data: {
    //       callFrom: 'global',
    //       titleId: selectedRncpTitleId,
    //       classId: selectedClassId,
    //       titleName: this.selectedRncpTitleName,
    //       titleLongName: this.selectedRncpTitleLongName,
    //     },
    //   })
    //   .afterClosed()
    //   .subscribe((result) => {
    //     this.getUrgentMail();
    //   });
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getMailbox();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  momentlang(event) {
    const dateRaw: any = moment(event).format('DD/MM/YYYY');
    if (typeof dateRaw === 'object') {
      const date = new Date(dateRaw.year, dateRaw.month, dateRaw.date, dateRaw.hour, dateRaw.minute);
      this.datePipe = new DatePipe(this.translate.currentLang);
      return this.datePipe.transform(date, 'EEE d MMM, y');
    } else {
      let date = dateRaw;
      if (typeof date === 'number') {
        date = date.toString();
      }
      if (date.length === 8) {
        const year: number = parseInt(date.substring(0, 4));
        const month: number = parseInt(date.substring(4, 6));
        const day: number = parseInt(date.substring(6, 8));
        date = new Date(year, month, day);
      }
      this.datePipe = new DatePipe(this.translate.currentLang);
      const formatDate = moment(date, 'DD/MM/YYYY');
      const dateTranslate = this.datePipe.transform(formatDate, 'EEEE d MMMM y');
      return dateTranslate;
    }
  }

  clearSelectIfFilter() {
    this.selection?.clear();
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
    if (filterItem.type === 'table_filter' && this.filteredValuesDate) {
      this.filteredValuesDate[filterItem.name] = null;
    }
    this.clearSelectIfFilter();
    this.getMailbox();
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'date', // name of the key in the object storing the filter
        column: 'MailBox.date', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValuesDate, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.dateFilter, // the ref to form control binded to the filter
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        isSelectionInput: false, // is it a dropdown input or a normal input/date
      },
      {
        type: 'table_filter',
        name: 'from',
        column: 'MailBox.from',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.fromFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'to',
        column: 'MailBox.to',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.toFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      },
      {
        type: 'table_filter',
        name: 'subject',
        column: 'MailBox.composeMail.subject',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.subjectFilter,
        displayKey: null,
        savedValue: null,
        isSelectionInput: false,
      }];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  translateTime(data) {
    return moment(data, 'HH:mm').format('H:mm');
  }
}
