import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { UserProfileData, UserProfileEntities } from 'app/users/user.model';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { PermissionService } from '../permission/permission.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { SubSink } from 'subsink';
declare var OSNameADMTC: any;
declare var browserNameADMTC: any;
declare var locationUrl: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: UserProfileData;
  isLoggedIn = false;
  private subs = new SubSink();

  private isConnectAsUserSource = new BehaviorSubject<boolean>(false);
  public isConnectAsUser$ = this.isConnectAsUserSource.asObservable();

  constructor(
    private router: Router,
    private apollo: Apollo,
    public permissionService: PermissionService,
    private translate: TranslateService,
    private ngZone: NgZone,
    private httpClient: HttpClient,
  ) {}

  getLocalStorageUser(): UserProfileData {
    this.userData = JSON.parse(localStorage.getItem('userProfile'));
    this.isLoggedIn = this.userData ? true : false;
    if (this.isLoginAsOther()) {
      this.isConnectAsUserSource.next(true);
    } else {
      this.isConnectAsUserSource.next(false);
    }
    return this.userData;
  }

  getCurrentUser(): UserProfileData {
    return this.userData;
  }

  handlerSessionExpired() {
    this.logOut();
  }

  loginUser(email: string, password: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation Login($email: String, $password: String) {
            Login(email: $email, password: $password) {
              token
              user {
                _id
                civility
                first_name
                last_name
                email
                student_id {
                  _id
                }
                position
                office_phone
                direct_line
                portable_phone
                profile_picture
                entities {
                  school {
                    _id
                    short_name
                  }
                  campus {
                    _id
                    name
                  }
                  level {
                    _id
                    name
                  }
                  programs {
                    school {
                      _id
                      short_name
                    }
                    campus {
                      _id
                      name
                    }
                    level {
                      _id
                      name
                    }
                  }
                  entity_name
                  school_type
                  group_of_schools {
                    _id
                    short_name
                  }
                  group_of_school {
                    _id
                    headquarter {
                      _id
                      short_name
                    }
                    school_members {
                      _id
                      short_name
                    }
                  }
                  school {
                    _id
                    short_name
                  }
                  assigned_rncp_title {
                    _id
                    short_name
                  }
                  class {
                    _id
                    name
                  }
                  type {
                    _id
                    name
                    usertype_permission_id {
                      _id
                      user_type_name
                      status
                      quick_search {
                        show_perm
                        search_user
                        search_student
                        search_mentor
                        search_school
                        search_teacher
                        search_tag
                      }
                      companies {
                        show_perm
                        edit_perm
                        add_company
                        delete_perm
                        organization {
                          show_perm
                          add_organization {
                            show_perm
                          }
                          edit_organization {
                            show_perm
                          }
                          delete_organization {
                            show_perm
                          }
                          organization_details {
                            show_perm
                          }
                          contact {
                            show_perm
                            add_contact {
                              show_perm
                            }
                            edit_contact {
                              show_perm
                            }
                            delete_contact {
                              show_perm
                            }
                          }
                        }
                        company_details {
                          company_detail {
                            show_perm
                            revision_perm
                            edit_perm
                          }
                          company_staff {
                            show_perm
                            edit_perm
                            add_perm
                            actions {
                              edit_perm
                              send_email
                              delete_perm
                            }
                          }
                          connected_school {
                            show_perm
                            edit_perm
                            connect_school
                            actions {
                              connect_mentor_to_School
                              delete_perm
                            }
                          }
                        }
                        company_entity {
                          show_perm
                          edit_perm
                          edit_company {
                            show_perm
                            edit_perm
                          }
                          add_company {
                            show_perm
                            edit_perm
                          }
                          note {
                            add_note
                            edit_perm
                          }
                          history_company {
                            show_perm
                            edit_perm
                          }
                          note_company {
                            show_perm
                            edit_perm
                          }
                          member_company {
                            show_perm
                            edit_perm
                          }
                          branch_company {
                            show_perm
                            edit_perm
                          }
                          internship_company {
                            show_perm
                            edit_perm
                          }
                          connect_school {
                            show_perm
                            edit_perm
                          }
                        }
                        company_branch {
                          show_perm
                          edit_perm
                          edit_company {
                            show_perm
                            edit_perm
                          }
                          add_company {
                            show_perm
                            edit_perm
                          }
                          note {
                            add_note
                          }
                          history_company {
                            show_perm
                            edit_perm
                          }
                          note_company {
                            show_perm
                            edit_perm
                          }
                          member_company {
                            show_perm
                            edit_perm
                          }
                          branch_company {
                            show_perm
                            edit_perm
                          }
                          internship_company {
                            show_perm
                            edit_perm
                          }
                          connect_school {
                            show_perm
                            edit_perm
                          }
                          company_staff {
                            show_perm
                            edit_perm
                            add_perm
                            actions {
                              edit_perm
                              send_email
                              delete_perm
                            }
                          }
                        }
                        mentors {
                          show_perm
                        }
                      }
                      tasks {
                        show_perm
                        add_task
                        internal_task
                        add_test_task
                        actions {
                          delete_task
                          edit_perm
                        }
                      }
                      mailbox {
                        show_perm
                        edit_perm
                        inbox
                        sent
                        important
                        draft
                        trash
                        actions {
                          download_email
                          urgent_message
                          mail_to_group
                          compose
                          important
                          delete
                        }
                      }
                      users {
                        show_perm
                        edit_perm
                        add_perm
                        export
                        transfer_responsibility
                        actions {
                          incognito
                          error_email
                          delete_perm
                          edit_perm
                          send_email
                          reminder_reg_user
                          btn_transfer_another_dev
                          btn_transfer_another_program
                          btn_view_student_card
                          btn_view_admission_file
                          btn_resend_registration_email
                          btn_reset
                        }
                      }
                      tutorials {
                        show_perm
                        edit_perm
                        tutorial_table
                        add_perm
                        actions {
                          view_perm
                          edit_perm
                          delete_perm
                          send
                        }
                        inapp_tutorials {
                          show_perm
                          edit_perm
                          actions {
                            btn_add_tutorial
                            btn_reset
                            btn_delete_tutorial
                            btn_view_tutorial
                            btn_publish_tutorial
                          }
                        }
                      }
                      candidate {
                        commentaries {
                          actions {
                            btn_add_comment
                          }
                        }
                        student_card {
                          student_tag {
                            show_perm
                            edit_perm
                            actions {
                              btn_add_tag
                              btn_edit_perm
                            }
                          }
                        }
                        follow_up_contract {
                          edit_perm
                          show_perm
                          actions {
                            btn_add_contract
                            btn_send_email
                            btn_send_reminder
                            btn_view_student_card
                            btn_view_admission_contract
                          }
                        }
                        candidate_tab {
                          show_perm
                          edit_perm
                          connect_as
                        }
                        candidate_history {
                          show_perm
                          edit_perm
                        }
                        admission_member {
                          show_perm
                          edit_perm
                        }
                        mentor {
                          show_perm
                          edit_perm
                        }
                        my_note {
                          show_perm
                          edit_perm
                        }
                        oscar_campus {
                          show_perm
                          edit_perm
                          oscar_import_button {
                            show_perm
                            edit_perm
                          }
                          hubspot_import_button {
                            show_perm
                            edit_perm
                          }
                          actions {
                            btn_import
                            btn_assign_program
                            btn_get_oscar_student
                            btn_export
                            btn_reset
                          }
                        }
                        hubspot {
                          show_perm
                          edit_perm
                          oscar_import_button {
                            show_perm
                            edit_perm
                          }
                          hubspot_import_button {
                            show_perm
                          }
                          actions {
                            btn_assign_program
                            btn_get_hubspot_student
                            btn_export
                            btn_reset
                          }
                        }
                        follow_up_continuous {
                          show_perm
                          actions {
                            btn_crm_ok
                            btn_assign_registration_profile_multiple
                            btn_1st_call_done_multiple
                            btn_1st_email_of_annoucment_multiple
                            btn_transfer_to_another_dev_multiple
                            btn_send_email_multiple
                            btn_reset
                            btn_export_csv
                            btn_assign_registration_profile
                            btn_1st_email_of_annoucment
                            btn_1st_call_done
                            btn_send_email
                            btn_transfer_to_another_dev
                            btn_view_student_card
                            btn_view_admission_file
                            btn_resend_registration_email
                            btn_transfer_another_program
                          }
                        }
                        show_perm
                        edit_perm
                        actions {
                          report_inscription {
                            show_perm
                          }
                          btn_assign_registration_profile_multiple
                          btn_1st_call_done_multiple
                          btn_1st_email_of_annoucment_multiple
                          btn_transfer_to_another_dev
                          btn_crm_ok
                          btn_assign_registration_profile
                          btn_1st_call_done
                          btn_1st_email_of_annoucment
                          btn_transfer_to_another_dev_multiple
                          btn_send_email_multiple
                          btn_export_csv
                          btn_reset
                          btn_send_email
                          btn_transfer_another_program
                          btn_view_student_card
                          btn_view_admission_file
                          btn_resend_registration_email
                        }
                        edit_perm
                        candidate_dashboard {
                          show_perm
                          edit_perm
                        }
                      }
                      intake_channel {
                        intake_channel {
                          show_perm
                          edit_perm
                        }
                        scholar_season {
                          show_perm
                          edit_perm
                          actions {
                            btn_add_scholar_season
                            btn_reset
                            btn_publish
                            btn_edit
                            btn_delete
                          }
                        }
                        school {
                          show_perm
                          edit_perm
                          actions {
                            btn_delete_school
                            btn_edit_school
                            btn_add_school
                            btn_export_csv
                            btn_reset
                          }
                          program {
                            show_perm
                            edit_perm
                            actions {
                              btn_reset
                              btn_export_csv
                              btn_add_program
                              btn_delete_program
                            }
                          }
                          down_payment {
                            show_perm
                            edit_perm
                            actions {
                              btn_export_csv
                              btn_import_down_payment
                            }
                          }
                          full_rate {
                            show_perm
                            edit_perm
                            actions {
                              btn_export_csv
                              btn_import_full_rate
                            }
                          }
                          legal {
                            show_perm
                            edit_perm
                            actions {
                              btn_reset
                              btn_export_csv
                              btn_connect_legal_entity
                              btn_paid_allowance_rate
                              btn_induced_hours
                            }
                          }
                          admission {
                            show_perm
                            edit_perm
                            actions {
                              btn_reset
                              btn_export_csv
                              btn_add_condition_multiple
                              btn_remove_registration_profile
                              btn_add_registration_profile
                            }
                          }
                          course_sequence {
                            show_perm
                            edit_perm
                            actions {
                              btn_reset
                              btn_connect_template
                              btn_details
                            }
                          }
                        }
                        level {
                          show_perm
                          edit_perm
                          actions {
                            btn_edit
                            btn_delete
                            btn_add_level
                            btn_reset
                          }
                        }
                        sector {
                          show_perm
                          edit_perm
                          actions {
                            btn_edit_sector
                            btn_delete_sector
                            btn_add_sector
                            btn_export_csv
                            btn_reset
                          }
                        }
                        site {
                          show_perm
                          edit_perm
                          actions {
                            btn_edit
                            btn_delete
                            btn_add_site
                            btn_reset
                          }
                        }
                        campus {
                          show_perm
                          edit_perm
                          actions {
                            btn_pin
                            btn_edit
                            btn_delete
                            btn_add_site_campus
                          }
                        }
                        full_rate {
                          show_perm
                          edit_perm
                          actions {
                            btn_edit_mode
                            btn_import
                            btn_export
                          }
                        }
                        speciality {
                          show_perm
                          edit_perm
                          actions {
                            btn_delete_speciality
                            btn_edit_speciality
                            btn_add_speciality
                            btn_export_csv
                            btn_reset
                          }
                        }
                        payment_terms {
                          show_perm
                          edit_perm
                        }
                        pricing_profile {
                          show_perm
                          edit_perm
                        }
                        show_perm
                        edit_perm
                        setting {
                          show_perm
                          edit_perm
                          additional_expense {
                            show_perm
                            edit_perm
                            actions {
                              btn_add_additional_expense
                              btn_export_additional_expense
                              btn_edit_additional_expense
                              btn_delete_additional_expense
                              btn_reset
                            }
                          }
                          type_of_formation {
                            actions {
                              btn_reset
                              btn_export_csv
                              btn_add_type_of_formation
                              btn_edit_type_of_formation
                              btn_delete_type_of_formation
                            }
                          }
                          payment_mode {
                            actions {
                              btn_reset
                              btn_export_csv
                              btn_add_payment_mode
                              btn_edit_payment_mode
                              btn_delete_payment_mode
                            }
                          }
                          registration_profile {
                            actions {
                              btn_reset
                              btn_add_registration_profile
                              btn_edit
                              btn_delete
                              btn_add_export
                            }
                          }
                          legal_entities {
                            actions {
                              btn_reset
                              btn_export_csv
                              btn_add_legal_entity
                              btn_edit_legal_entity
                              btn_delete_legal_entity
                              btn_view_legal_entity
                              btn_publish_or_unpublish_legal_entity
                            }
                          }
                        }
                      }
                      setting {
                        user_permission {
                          show_perm
                        }
                        import_objective {
                          show_perm
                          edit_perm
                        }
                        import_objective_finance {
                          show_perm
                          edit_perm
                        }
                        import_finance_n1 {
                          show_perm
                          edit_perm
                        }
                        external_promotion {
                          show_perm
                          edit_perm
                          actions {
                            btn_delete_diapos_external
                            btn_edit_diapos_external
                            btn_add_diapos_external
                            btn_view_diapos_external
                            btn_send_email
                            btn_duplicate_diapos_external
                            btn_publish_diapos_external
                            btn_export_csv
                            btn_reset
                          }
                        }
                        message_step {
                          show_perm
                          edit_perm
                          actions {
                            btn_delete_message_step
                            btn_edit_message_step
                            btn_add_message_step
                            btn_view_message_step
                            btn_send_email
                            btn_duplicate_message_step
                            btn_publish_message_step
                            btn_export_csv
                            btn_reset
                          }
                        }
                        cels_segmentation {
                          show_perm
                          edit_perm
                        }
                        cels_action {
                          show_perm
                          edit_perm
                        }
                        notification_management {
                          show_perm
                          edit_perm
                          actions {
                            btn_edit_notification
                            btn_reset
                            btn_delete_template
                            btn_edit_template
                            btn_add_template
                            btn_view_template
                            btn_reset_template
                          }
                        }
                        show_perm
                        edit_perm
                      }
                      history {
                        notifications {
                          show_perm
                          actions {
                            btn_reset
                            btn_filter_today
                            btn_filter_yesterday
                            btn_filter_last_7_days
                            btn_filter_last_30_days
                            btn_view_notification
                          }
                        }
                        show_perm
                      }
                      finance {
                        unbalanced_balance {
                          show_perm
                          edit_perm
                          actions {
                            btn_export
                            btn_reset
                            send_school_contract_amendment
                          }
                        }
                        operation_lines {
                          show_perm
                          edit_perm
                          not_exported {
                            show_perm
                            edit_perm
                            actions {
                              export_sage
                              export_lines_to_export
                              export_lines_exported
                              export_all_lines
                              btn_reset
                            }
                          }
                          exported {
                            show_perm
                            edit_perm
                            btn_reset
                          }
                        }
                        timeline_template {
                          show_perm
                          create_timeline_template {
                            show_perm
                          }
                          edit_timeline_template {
                            show_perm
                          }
                          delete_timeline_template {
                            show_perm
                          }
                        }
                        general {
                          show_perm
                          edit_perm
                        }
                        cash_in {
                          show_perm
                          edit_perm
                        }
                        payment {
                          show_perm
                          edit_perm
                        }
                        follow_up {
                          show_perm
                          edit_perm
                          actions {
                            btn_generate_billing
                            btn_send_mail_multiple
                            add_payment
                            btn_view_student_card
                            btn_edit_term
                            btn_send_email
                            btn_export
                            btn_reset
                            btn_asking_payment
                          }
                        }
                        member {
                          show_perm
                          edit_perm
                        }
                        history {
                          show_perm
                          edit_perm
                          actions {
                            btn_reconciliation
                            btn_lettrage
                            btn_see_student_file
                            btn_create_internal_task
                            btn_send_email
                            btn_export_csv
                            btn_reset
                            btn_filter_today
                            btn_filter_yesterday
                            btn_filter_last_7_days
                            btn_filter_last_30_days
                            btn_filter_this_month
                          }
                        }
                        reconciliation_letterage {
                          show_perm
                          edit_perm
                        }
                        cheque {
                          show_perm
                          edit_perm
                        }
                        transaction_report {
                          show_perm
                          edit_perm
                          actions {
                            btn_export_csv
                            btn_reset
                            btn_filter_today
                            btn_filter_yesterday
                            btn_filter_last_7_days
                            btn_filter_last_30_days
                            btn_view_transaction_detail
                          }
                        }
                        balance_report {
                          show_perm
                          edit_perm
                          actions {
                            btn_export_csv
                            btn_reset
                            btn_filter_today
                            btn_filter_yesterday
                            btn_filter_last_7_days
                            btn_filter_last_30_days
                            btn_view_transaction_detail
                          }
                        }
                        follow_up_organization {
                          show_perm
                          edit_perm
                          actions {
                            btn_generate_billing
                            btn_send_mail_multiple
                            btn_assign_timeline_multiple
                            btn_export
                            btn_reset
                            btn_send_email
                            add_payment
                            btn_view_student_card
                            btn_edit_term
                            btn_assign_timeline
                          }
                        }
                        master_table_transaction {
                          show_perm
                          actions {
                            btn_export
                            btn_view_transaction
                            btn_view_detail
                            btn_view_student_card
                          }
                        }
                        show_perm
                        edit_perm
                      }
                      alumni {
                        follow_up {
                          show_perm
                          edit_perm
                          actions {
                            btn_export
                            btn_send_survey
                            btn_reset
                            btn_send_survey_multiple
                            btn_send_email
                            btn_view_alumni_card
                          }
                        }
                        member {
                          show_perm
                          edit_perm
                        }
                        card {
                          show_perm
                          edit_perm
                          actions {
                            btn_add_alumni
                            btn_reset
                            btn_add_comment
                            btn_save_identity
                            btn_history_export
                          }
                        }
                        trombinoscope {
                          show_perm
                          edit_perm
                        }
                        show_perm
                        edit_perm
                      }
                      internship {
                        internship_posting {
                          show_perm
                          edit_perm
                        }
                        internship_profile {
                          show_perm
                          edit_perm
                        }
                        candidature {
                          show_perm
                          edit_perm
                        }
                        agreement {
                          show_perm
                          edit_perm
                        }
                        show_perm
                        follow_up {
                          show_perm
                          edit_perm
                        }
                        setting {
                          show_perm
                        }
                        user {
                          show_perm
                        }
                        edit_perm
                      }
                      contracts {
                        show_perm
                        edit_perm
                        contract_process {
                          show_perm
                          edit_perm
                          actions {
                            btn_send_the_form
                            btn_template_for_import
                            btn_import_contract
                            btn_new_contract
                            btn_reset
                            btn_go_to_form
                            btn_edit_contract
                            btn_send_reminder
                            btn_send_email
                            btn_additional_document
                            btn_remove_contract
                          }
                        }
                      }
                      process {
                        show_perm
                        edit_perm
                        document {
                          show_perm
                          edit_perm
                          actions {
                            btn_add_template
                            btn_reset
                            btn_edit
                            btn_delete_template
                            btn_duplicate_template
                          }
                        }
                        form_builder {
                          show_perm
                          edit_perm
                          actions {
                            btn_add_template
                            btn_reset
                            btn_delete_template
                            btn_edit_template
                            btn_duplicate_template
                          }
                        }
                        alumni_survey {
                          show_perm
                          edit_perm
                        }
                      }
                      courses_sequences {
                        show_perm
                        edit_perm
                        btn_export {
                          show_perm
                        }
                        btn_reset {
                          show_perm
                        }
                        btn_add_subject {
                          show_perm
                        }
                        template {
                          create_perm
                          edit_perm
                          show_perm
                          export_perm
                          actions {
                            btn_reset
                            btn_delete
                            btn_duplicate
                          }
                        }
                        sequence {
                          create_perm
                          edit_perm
                          show_perm
                          export_perm
                          actions {
                            btn_reset
                            btn_delete
                            btn_duplicate
                          }
                        }
                        module {
                          create_perm
                          edit_perm
                          show_perm
                          export_perm
                          actions {
                            btn_reset
                            btn_delete
                            btn_template_import
                            btn_import_module
                          }
                        }
                        subject {
                          create_perm
                          edit_perm
                          show_perm
                          export_perm
                          actions {
                            btn_template_import
                            btn_import_subject
                            btn_reset
                            btn_delete
                          }
                        }
                      }

                      readmission {
                        show_perm
                        assignment {
                          show_perm
                          actions {
                            btn_edit_jury_decision
                            btn_edit_program_desired
                            btn_assign_program
                            btn_send_email
                            btn_export
                            btn_financial_situation
                            btn_template_import
                            btn_import_file
                            btn_assign_program_multiple
                            btn_reset
                            btn_assign_program
                            btn_view_student_card
                          }
                        }
                        follow_up {
                          show_perm
                          actions {
                            btn_assign_registration_profile
                            btn_admission_email
                            btn_send_email
                            btn_export
                            btn_assign_registration_profile_multiple
                            btn_admission_email_multiple
                            btn_send_email_multiple
                            btn_reset
                            btn_transfer_to_another_dev
                            btn_transfer_another_program
                            btn_view_student_card
                            btn_view_admission_file
                            btn_resend_registration_email
                            btn_edit_jury_decision
                            btn_send_reminder
                            btn_transfer_to_another_dev_multiple
                          }
                        }
                      }
                      form_follow_up {
                        show_perm
                        general_form_follow_up {
                          show_perm
                          edit_perm
                        }
                        admission_document_form_follow_up {
                          show_perm
                          edit_perm
                        }
                      }
                      teacher_management {
                        show_perm
                        teacher_follow_up {
                          show_perm
                          actions {
                            btn_generate_contract
                            btn_export
                            btn_view
                            btn_generate_contract_action
                          }
                        }
                        contract_process {
                          show_perm
                          actions {
                            btn_add_type_of_intervention
                            btn_export
                            btn_edit
                            btn_delete
                          }
                        }
                        teachers_table {
                          show_perm
                          actions {
                            btn_add_type_of_intervention
                            btn_export
                            btn_edit
                            btn_delete
                          }
                        }
                        contract_process {
                          show_perm
                          actions {
                            btn_add_type_of_intervention
                            btn_export
                            btn_edit
                            btn_delete
                          }
                        }
                      }
                      students {
                        show_perm
                        edit_perm
                        export {
                          show_perm
                        }
                        follow_up {
                          show_perm
                          edit_perm
                          actions {
                            btn_reset
                            btn_send_email
                            btn_assign_sequence
                            btn_export
                          }
                        }
                        trombinoscope {
                          show_perm
                          edit_perm
                          actions {
                            btn_reset
                            btn_filter
                            btn_export_pdf
                          }
                        }
                        all_students {
                          show_perm
                          edit_perm
                          actions {
                            btn_export
                            btn_reset
                            btn_send_email
                            btn_add_multiple_tags
                            btn_remove_multiple_tags
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          email,
          password,
        },
      })
      .pipe(
        map((resp) => {
          // this.setLocalUserProfileAndToken(resp.data['Login']);
          return resp;
        }),
      );
  }

  resetPasswordV2(value: { lang: string; email: string }): Observable<any> {
    const requestForgotPassword = gql`
      mutation RequestForgotPassword{
        RequestForgotPassword(lang: "${value.lang}", email: "${value.email}") {
          message
		      school
        }
      }
    `;
    return this.apollo
      .mutate({
        mutation: requestForgotPassword,
        errorPolicy: 'all',
      })
      .pipe(
        map((resp) => {
          return resp;
        }),
      );
  }

  logOut() {
    this.removeLocalUserProfile();
    localStorage.removeItem('version');
    this.router.navigate(['/session/login']);
    this.isConnectAsUserSource.next(false);
  }

  setLocalUserProfileAndToken(value: { token: string; user: UserProfileData }) {
    localStorage.setItem('userProfile', JSON.stringify(value.user));
    localStorage.setItem(environment.tokenKey, JSON.stringify(value.token));
    this.permissionService.resetServiceData();
    this.isLoggedIn = true;
  }

  backupLocalUserProfileAndToken() {
    const backupUser = JSON.parse(localStorage.getItem('userProfile'));
    const backupTemplateTable = JSON.parse(localStorage.getItem('templateTable'));
    const backupToken = JSON.parse(localStorage.getItem('admtc-token-encryption'));
    localStorage.removeItem('templateTable');
    localStorage.setItem('backupUser', JSON.stringify(backupUser));
    localStorage.setItem('backupToken', JSON.stringify(backupToken));
    localStorage.setItem('backupTemplateTable', JSON.stringify(backupTemplateTable));
    this.isConnectAsUserSource.next(true);
  }

  connectAsStudent(user, permissions, from?) {
    const action = from ? from : 'connect';
    const actionData = window.btoa(action);
    
    const userData = window.btoa(JSON.stringify({
      token: user?.token,
      user: {
        civility: user?.user?.civility,
        direct_line: user?.user?.direct_line,
        email: user?.user?.email,
        entities: user?.user?.entities.map(element => {
          return {
            type: {
              _id: element?.type?._id
            }
          }
        }),
        first_name: user?.user?.first_name,
        last_name: user?.user?.last_name,
        office_phone: user?.user?.office_phone,
        portable_phone: user?.user?.portable_phone,
        position: user?.user?.position,
        profile_picture: user?.user?.profile_picture,
        student_id: {
          _id: user?.user?.student_id?._id
        },
        _id: user?.user?._id
      }
    }));

    const permissionsData = window.btoa(permissions);
    window.open(environment.studentEnvironment + `?a=${actionData}&u=${userData}&p=${permissionsData}`, '_blank');    
  }

  async connectAsStudentFromLoginPage(user, permissions, from?) {
    const action = from ? from : 'login';
    const actionData = window.btoa(action);

    const userData = window.btoa(JSON.stringify({
      token: user?.token,
      user: {
        civility: user?.user?.civility,
        direct_line: user?.user?.direct_line,
        email: user?.user?.email,
        entities: user?.user?.entities.map(element => {
          return {
            type: {
              _id: element?.type?._id
            }
          }
        }),
        first_name: user?.user?.first_name,
        last_name: user?.user?.last_name,
        office_phone: user?.user?.office_phone,
        portable_phone: user?.user?.portable_phone,
        position: user?.user?.position,
        profile_picture: user?.user?.profile_picture,
        student_id: {
          _id: user?.user?.student_id?._id
        },
        _id: user?.user?._id
      }
    }));

    const permissionsData = window.btoa(permissions);
    window.open(environment.studentEnvironment + `?a=${actionData}&u=${userData}&p=${permissionsData}`, '_blank');
  }

  isLoginAsOther() {
    return !!(
      localStorage.getItem('backupUser') &&
      JSON.parse(localStorage.getItem('backupUser')) &&
      localStorage.getItem('backupToken') &&
      JSON.parse(localStorage.getItem('backupToken'))
    );
  }

  loginAsPreviousUser() {
    const user = JSON.parse(localStorage.getItem('backupUser'));
    const token = JSON.parse(localStorage.getItem('backupToken'));
    const templateTable = JSON.parse(localStorage.getItem('backupTemplateTable'));
    console.log('backup data', user);
    localStorage.setItem('userProfile', JSON.stringify(user));
    localStorage.setItem('templateTable', JSON.stringify(templateTable));
    localStorage.setItem(environment.tokenKey, JSON.stringify(token));
    localStorage.removeItem('backupUser');
    localStorage.removeItem('backupToken');
    localStorage.removeItem('backupTemplateTable');
    this.isLoggedIn = true;
    this.permissionService.resetServiceData();
    this.isConnectAsUserSource.next(false);
  }

  setLocalUserProfile(user: UserProfileData) {
    localStorage.setItem('userProfile', JSON.stringify(user));
  }

  setPermission(data: string[]) {
    const conversionEncryptOutput = CryptoJS.AES.encrypt(JSON.stringify(data), 'Key').toString();
    console.log('conversionEncryptOutput : ', conversionEncryptOutput, data);
    localStorage.setItem('permissions', conversionEncryptOutput);
  }

  getPermission(): string[] {
    if (!localStorage.getItem('permissions')) {
      return [];
    }
    const conversionDecryptOutput = CryptoJS.AES.decrypt(localStorage.getItem('permissions'), 'Key').toString(CryptoJS.enc.Utf8);
    // console.log('conversionDecryptOutput : ',conversionDecryptOutput);
    return JSON.parse(conversionDecryptOutput);
  }

  removeLocalUserProfile() {
    localStorage.removeItem('userProfile');
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem('permissions');
    localStorage.removeItem('backupUser');
    localStorage.removeItem('backupToken');
    localStorage.removeItem('backupTemplateTable');
    localStorage.removeItem('templateTable');
    this.isLoggedIn = false;
  }

  setPassword(token: string, password: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SetPassword{
            SetPassword(token: "${token}", password: "${password}") {
              email
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data));
  }

  getUserById(userId: string) {
    return this.apollo
      .query({
        query: gql`query GetOneUser{
         GetOneUser(_id:"${userId}"){
            _id
            civility
            first_name
            last_name
            email
            position
            office_phone
            direct_line
            portable_phone
            profile_picture
            entities {
              school{
                _id
                short_name
              }
              campus{
                _id
                name
              }
              level{
                _id
                name
              }
              entity_name
              school_type
              group_of_schools {
                  _id
                  short_name
              }
              school {
                  _id
                  short_name
              }
              assigned_rncp_title {
                  _id
                  short_name
              }
              class {
                  _id
                  name
              }
              type {
                  _id
                  name
              }
              programs {
                school {
                  _id
                  short_name
                }
              }
            }
          }
      }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetOneUser']));
  }

  getUserForDashboard(userId: string) {
    return this.apollo
      .query({
        query: gql`query getUserForDashboard {
         GetOneUser(_id:"${userId}"){
            _id
            civility
            first_name
            last_name
            email
            position
            office_phone
            direct_line
            portable_phone
            profile_picture
            entities {
              school{
                _id
                short_name
              }
              campus{
                _id
                name
              }
              level{
                _id
                name
              }
              entity_name
              school_type
              group_of_schools {
                _id
                short_name
              }
              school {
                  _id
                  short_name
              }
              assigned_rncp_title {
                _id
                short_name
              }
              class {
                _id
                name
              }
              type {
                _id
                name
              }
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetOneUser']));
  }

  verifRecaptcha(token: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query VerifyRecaptcha{
          VerifyRecaptcha (token: "${token}"){
              success
              challenge_ts
              hostname
              score
              action
          }
      }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['VerifyRecaptcha']));
  }

  loginAsUser(loggedInUserId: string, userToLoginId: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation LoginAsUserIncognito{
        loginAsUserIncognito(logged_in_user: "${loggedInUserId}", user_to_login: "${userToLoginId}") {
          token
          user {
            _id
            civility
            first_name
            last_name
            email
            student_id {
              _id
            }
            position
            office_phone
            direct_line
            portable_phone
            profile_picture
            student_id {
              _id
            }
            entities {
              school{
                _id
                short_name
              }
              campus{
                _id
                name
              }
              level{
                _id
                name
              }
              programs {
                school {
                  _id
                  short_name
                }
                campus {
                  _id
                  name
                }
                level {
                  _id
                  name
                }
              }
              entity_name
              school_type
              group_of_schools {
                _id
                short_name
              }
              group_of_school{
                _id
                headquarter {
                  _id
                  short_name
                }
                school_members {
                  _id
                  short_name
                }
              }
              school {
                _id
                short_name
              }
              assigned_rncp_title {
                _id
                short_name
              }
              class {
                _id
                name
              }
              type {
                _id
                name
                usertype_permission_id {
                  _id
                  user_type_name
                  status
                  quick_search {
                    show_perm
                    search_user
                    search_student
                    search_mentor
                    search_school
                    search_teacher
                    search_tag
                  }
                  companies {
                    show_perm
                    edit_perm
                    add_company
                    delete_perm
                    organization {
                      show_perm
                      add_organization {
                        show_perm
                      }
                      edit_organization {
                        show_perm
                      }
                      delete_organization {
                        show_perm
                      }
                      organization_details {
                        show_perm
                      }
                      contact {
                        show_perm
                        add_contact {
                          show_perm
                        }
                        edit_contact {
                          show_perm
                        }
                        delete_contact {
                          show_perm
                        }
                      }
                    }
                    company_details {
                      company_detail {
                        show_perm
                        revision_perm
                        edit_perm
                      }
                      company_staff {
                        show_perm
                        edit_perm
                        add_perm
                        actions {
                          edit_perm
                          send_email
                          delete_perm
                        }
                      }
                      connected_school {
                        show_perm
                        edit_perm
                        connect_school
                        actions {
                          connect_mentor_to_School
                          delete_perm
                        }
                      }
                    }
                    company_entity {
                      show_perm
                      edit_perm
                      edit_company {
                        show_perm
                        edit_perm
                      }
                      add_company {
                        show_perm
                        edit_perm
                      }
                      note {
                        add_note
                        edit_perm
                      }
                      history_company {
                        show_perm
                        edit_perm
                      }
                      note_company {
                        show_perm
                        edit_perm
                      }
                      member_company {
                        show_perm
                        edit_perm
                      }
                      branch_company {
                        show_perm
                        edit_perm
                      }
                      internship_company {
                        show_perm
                        edit_perm
                      }
                      connect_school {
                        show_perm
                        edit_perm
                      }
                    }
                    company_branch {
                      show_perm
                      edit_perm
                      edit_company {
                        show_perm
                        edit_perm
                      }
                      add_company {
                        show_perm
                        edit_perm
                      }
                      note {
                        add_note
                      }
                      history_company {
                        show_perm
                        edit_perm
                      }
                      note_company {
                        show_perm
                        edit_perm
                      }
                      member_company {
                        show_perm
                        edit_perm
                      }
                      branch_company {
                        show_perm
                        edit_perm
                      }
                      internship_company {
                        show_perm
                        edit_perm
                      }
                      connect_school {
                        show_perm
                        edit_perm
                      }
                      company_staff {
                        show_perm
                        edit_perm
                        add_perm
                        actions {
                          edit_perm
                          send_email
                          delete_perm
                        }
                      }
                    }
                    mentors {
                      show_perm
                    }
                  }
                  tasks {
                    show_perm
                    add_task
                    internal_task
                    add_test_task
                    actions {
                      delete_task
                      edit_perm
                    }
                  }
                  mailbox {
                    show_perm
                    edit_perm
                    inbox
                    sent
                    important
                    draft
                    trash
                    actions {
                      download_email
                      urgent_message
                      mail_to_group
                      compose
                      important
                      delete
                    }
                  }
                  users {
                    show_perm
                    edit_perm
                    add_perm
                    export
                    transfer_responsibility
                    actions {
                      incognito
                      error_email
                      delete_perm
                      edit_perm
                      send_email
                      reminder_reg_user
                      btn_transfer_another_dev
                      btn_transfer_another_program
                      btn_view_student_card
                      btn_view_admission_file
                      btn_resend_registration_email
                      btn_reset
                    }
                  }
                  tutorials {
                    show_perm
                    edit_perm
                    tutorial_table
                    add_perm
                    actions {
                      view_perm
                      edit_perm
                      delete_perm
                      send
                    }
                    inapp_tutorials {
                      show_perm
                      edit_perm
                      actions{
                        btn_add_tutorial
                        btn_reset
                        btn_delete_tutorial
                        btn_view_tutorial
                        btn_publish_tutorial
                      }
                    }
                  }
                  candidate {
                    commentaries {
                      actions{
                        btn_add_comment
                      }
                    }
                    student_card {
                      student_tag {
                        show_perm
                        edit_perm
                        actions {
                          btn_add_tag
                          btn_edit_perm
                        }
                      }
                    }
                    follow_up_contract {
                      edit_perm
                      show_perm
                      actions{
                        btn_add_contract
                        btn_send_email
                        btn_send_reminder
                        btn_view_student_card
                        btn_view_admission_contract
                      }
                    }
                    candidate_tab {
                      show_perm
                      edit_perm
                      connect_as
                    }
                    candidate_history {
                      show_perm
                      edit_perm
                    }
                    admission_member {
                      show_perm
                      edit_perm
                    }
                    mentor {
                      show_perm
                      edit_perm
                    }
                    my_note {
                      show_perm
                      edit_perm
                    }
                    oscar_campus {
                      show_perm
                      edit_perm
                      oscar_import_button {
                        show_perm
                        edit_perm
                      }
                      hubspot_import_button {
                        show_perm
                        edit_perm
                      }
                      actions {
                        btn_import
                        btn_assign_program
                        btn_get_oscar_student
                        btn_export
                        btn_reset
                      }
                    }
                    hubspot {
                      show_perm
                      edit_perm
                      oscar_import_button {
                        show_perm
                        edit_perm
                      }
                      hubspot_import_button {
                        show_perm
                      }
                      actions {
                        btn_assign_program
                        btn_get_hubspot_student
                        btn_export
                        btn_reset
                      }
                    }
                    follow_up_continuous {
                        show_perm
                        actions{
                          btn_crm_ok
                          btn_assign_registration_profile_multiple
                          btn_1st_call_done_multiple
                          btn_1st_email_of_annoucment_multiple
                          btn_transfer_to_another_dev_multiple
                          btn_send_email_multiple
                          btn_reset
                          btn_export_csv
                          btn_assign_registration_profile
                          btn_1st_email_of_annoucment
                          btn_1st_call_done
                          btn_send_email
                          btn_transfer_to_another_dev
                          btn_view_student_card
                          btn_view_admission_file
                          btn_resend_registration_email
                          btn_transfer_another_program
                        }
                      }
                    show_perm
                    edit_perm
                    actions {
                      report_inscription {
                        show_perm
                      }
                      btn_assign_registration_profile_multiple
                      btn_1st_call_done_multiple
                      btn_1st_email_of_annoucment_multiple
                      btn_transfer_to_another_dev
                      btn_crm_ok
                      btn_assign_registration_profile
                      btn_1st_call_done
                      btn_1st_email_of_annoucment
                      btn_transfer_to_another_dev_multiple
                      btn_send_email_multiple
                      btn_export_csv
                      btn_reset
                      btn_send_email
                      btn_transfer_another_program
                      btn_view_student_card
                      btn_view_admission_file
                      btn_resend_registration_email
                    }
                    edit_perm
                    candidate_dashboard {
                      show_perm
                      edit_perm
                    }
                  }
                  intake_channel {
                    intake_channel {
                      show_perm
                      edit_perm
                    }
                    scholar_season {
                      show_perm
                      edit_perm
                      actions{
                        btn_add_scholar_season
                        btn_reset
                        btn_publish
                        btn_edit
                        btn_delete
                      }
                    }
                    school {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_school
                        btn_edit_school
                        btn_add_school
                        btn_export_csv
                        btn_reset
                      }
                      program {
                        show_perm
                        edit_perm
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_program
                          btn_delete_program
                        }
                      }
                      down_payment {
                        show_perm
                        edit_perm
                        actions {
                          btn_export_csv
                          btn_import_down_payment
                        }
                      }
                      full_rate {
                        show_perm
                        edit_perm
                        actions {
                          btn_export_csv
                          btn_import_full_rate
                        }
                      }
                      legal{
                        show_perm
                        edit_perm
                        actions {
                          btn_reset
                          btn_export_csv
                          btn_connect_legal_entity
                          btn_paid_allowance_rate
                          btn_induced_hours
                        }
                      }
                      admission{
                        show_perm
                        edit_perm
                        actions {
                          btn_reset
                          btn_export_csv
                          btn_add_condition_multiple
                          btn_remove_registration_profile
                          btn_add_registration_profile
                        }
                      }
                      course_sequence{
                        show_perm
                        edit_perm
                        actions {
                          btn_reset
                          btn_connect_template
                          btn_details
                        }
                      }
                    }
                    level {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit
                        btn_delete
                        btn_add_level
                        btn_reset
                      }
                    }
                    sector {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit_sector
                        btn_delete_sector
                        btn_add_sector
                        btn_export_csv
                        btn_reset
                      }
                    }
                    site {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit
                        btn_delete
                        btn_add_site
                        btn_reset
                      }
                    }
                    campus {
                      show_perm
                      edit_perm
                      actions {
                        btn_pin
                        btn_edit
                        btn_delete
                        btn_add_site_campus
                      }
                    }
                    full_rate {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit_mode
                        btn_import
                        btn_export
                      }
                    }
                    speciality {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_speciality
                        btn_edit_speciality
                        btn_add_speciality
                        btn_export_csv
                        btn_reset
                      }
                    }
                    payment_terms {
                      show_perm
                      edit_perm
                    }
                    pricing_profile {
                      show_perm
                      edit_perm
                    }
                    show_perm
                    edit_perm
                    setting {
                      show_perm
                      edit_perm
                      additional_expense {
                        show_perm
                        edit_perm
                        actions {
                          btn_add_additional_expense
                          btn_export_additional_expense
                          btn_edit_additional_expense
                          btn_delete_additional_expense
                          btn_reset
                        }
                      }
                      type_of_formation{
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_type_of_formation
                          btn_edit_type_of_formation
                          btn_delete_type_of_formation
                        }
                      }
                      payment_mode {
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_payment_mode
                          btn_edit_payment_mode
                          btn_delete_payment_mode
                        }
                      }
                      registration_profile {
                        actions{
                          btn_reset
                          btn_add_registration_profile
                          btn_edit
                          btn_delete
                          btn_add_export
                        }
                      }
                      legal_entities{
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_legal_entity
                          btn_edit_legal_entity
                          btn_delete_legal_entity
                          btn_view_legal_entity
                          btn_publish_or_unpublish_legal_entity
                        }
                      }
                    }
                  }
                  setting {
                    user_permission {
                      show_perm
                    }
                    import_objective {
                      show_perm
                      edit_perm
                    }
                    import_objective_finance {
                      show_perm
                      edit_perm
                    }
                    import_finance_n1 {
                      show_perm
                      edit_perm
                    }
                    external_promotion {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_diapos_external
                        btn_edit_diapos_external
                        btn_add_diapos_external
                        btn_view_diapos_external
                        btn_send_email
                        btn_duplicate_diapos_external
                        btn_publish_diapos_external
                        btn_export_csv
                        btn_reset
                      }
                    }
                    message_step {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_message_step
                        btn_edit_message_step
                        btn_add_message_step
                        btn_view_message_step
                        btn_send_email
                        btn_duplicate_message_step
                        btn_publish_message_step
                        btn_export_csv
                        btn_reset
                      }
                    }
                    cels_segmentation {
                      show_perm
                      edit_perm
                    }
                    cels_action {
                      show_perm
                      edit_perm
                    }
                    notification_management {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit_notification
                        btn_reset
                        btn_delete_template
                        btn_edit_template
                        btn_add_template
                        btn_view_template
                        btn_reset_template
                      }
                    }
                    show_perm
                    edit_perm
                  }
                  history {
                    notifications {
                      show_perm
                      actions {
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_view_notification
                      }
                    }
                    show_perm
                  }
                  finance {
                    unbalanced_balance {
                      show_perm
                      edit_perm
                      actions {
                        btn_export
                        btn_reset
                        send_school_contract_amendment
                      }
                    }
                    operation_lines {
                      show_perm
                      edit_perm
                      not_exported {
                        show_perm
                        edit_perm
                        actions {
                          export_sage
                          export_lines_to_export
                          export_lines_exported
                          export_all_lines
                          btn_reset
                        }
                      }
                      exported {
                        show_perm
                        edit_perm
                        btn_reset
                      }
                    }
                    timeline_template{
                      show_perm
                      create_timeline_template{
                        show_perm
                      }
                      edit_timeline_template{
                        show_perm
                      }
                      delete_timeline_template{
                        show_perm
                      }
                    }
                    general {
                      show_perm
                      edit_perm
                    }
                    cash_in {
                      show_perm
                      edit_perm
                    }
                    payment {
                      show_perm
                      edit_perm
                    }
                    follow_up {
                      show_perm
                      edit_perm
                      actions {
                        btn_generate_billing
                        btn_send_mail_multiple
                        add_payment
                        btn_view_student_card
                        btn_edit_term
                        btn_send_email
                        btn_export
                        btn_reset
                        btn_asking_payment
                      }
                    }
                    member {
                      show_perm
                      edit_perm
                    }
                    history {
                      show_perm
                      edit_perm
                      actions {
                        btn_reconciliation
                        btn_lettrage
                        btn_see_student_file
                        btn_create_internal_task
                        btn_send_email
                        btn_export_csv
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_filter_this_month
                      }
                    }
                    reconciliation_letterage {
                      show_perm
                      edit_perm
                    }
                    cheque {
                      show_perm
                      edit_perm
                    }
                    transaction_report {
                      show_perm
                      edit_perm
                      actions {
                        btn_export_csv
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_view_transaction_detail
                      }
                    }
                    balance_report {
                      show_perm
                      edit_perm
                      actions {
                        btn_export_csv
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_view_transaction_detail
                      }
                    }
                    follow_up_organization {
                      show_perm
                      edit_perm
                      actions{
                        btn_generate_billing
                        btn_send_mail_multiple
                        btn_assign_timeline_multiple
                        btn_export
                        btn_reset
                        btn_send_email
                        add_payment
                        btn_view_student_card
                        btn_edit_term
                        btn_assign_timeline
                      }
                    }
                    master_table_transaction {
                      show_perm
                      actions {
                        btn_export
                        btn_view_transaction
                        btn_view_detail
                        btn_view_student_card
                      }
                    }
                    show_perm
                    edit_perm
                  }
                  alumni {
                    follow_up {
                      show_perm
                      edit_perm
                      actions {
                        btn_export
                        btn_send_survey
                        btn_reset
                        btn_send_survey_multiple
                        btn_send_email
                        btn_view_alumni_card
                      }
                    }
                    member {
                      show_perm
                      edit_perm
                    }
                    card {
                      show_perm
                      edit_perm
                      actions {
                        btn_add_alumni
                        btn_reset
                        btn_add_comment
                        btn_save_identity
                        btn_history_export
                      }
                    }
                    trombinoscope {
                      show_perm
                      edit_perm
                    }
                    show_perm
                    edit_perm
                  }
                  internship {
                    internship_posting {
                      show_perm
                      edit_perm
                    }
                    internship_profile {
                      show_perm
                      edit_perm
                    }
                    candidature {
                      show_perm
                      edit_perm
                    }
                    agreement {
                      show_perm
                      edit_perm
                    }
                    show_perm
                    follow_up {
                      show_perm
                      edit_perm
                    }
                    setting {
                      show_perm
                    }
                    user {
                      show_perm
                    }
                    edit_perm
                  }
                  contracts {
                    show_perm
                    edit_perm
                    contract_process {
                      show_perm
                      edit_perm
                      actions {
                        btn_send_the_form
                        btn_template_for_import
                        btn_import_contract
                        btn_new_contract
                        btn_reset
                        btn_go_to_form
                        btn_edit_contract
                        btn_send_reminder
                        btn_send_email
                        btn_additional_document
                        btn_remove_contract
                      }
                    }
                  }
                  process {
                    show_perm
                    edit_perm
                    document {
                      show_perm
                      edit_perm
                      actions {
                        btn_add_template
                        btn_reset
                        btn_edit
                        btn_delete_template
                        btn_duplicate_template
                      }
                    }
                    form_builder {
                      show_perm
                      edit_perm
                      actions {
                        btn_add_template
                        btn_reset
                        btn_delete_template
                        btn_edit_template
                        btn_duplicate_template
                      }
                    }
                    alumni_survey {
                      show_perm
                      edit_perm
                    }
                  }
                  courses_sequences {
                    show_perm
                    edit_perm
                    btn_export {
                      show_perm
                    }
                    btn_reset {
                      show_perm
                    }
                    btn_add_subject {
                      show_perm
                    }
                    template{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_reset
                          btn_delete
                          btn_duplicate
                        }
                      }
                      sequence{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_reset
                          btn_delete
                          btn_duplicate
                        }
                      }
                      module{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_reset
                          btn_delete
                          btn_template_import
                          btn_import_module
                        }
                      }
                      subject{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_template_import
                          btn_import_subject
                          btn_reset
                          btn_delete
                        }
                      }
                  }
                  readmission {
                    show_perm
                    assignment {
                      show_perm
                      actions {
                        btn_edit_jury_decision
                        btn_edit_program_desired
                        btn_assign_program
                        btn_send_email
                        btn_export
                        btn_financial_situation
                        btn_template_import
                        btn_import_file
                        btn_assign_program_multiple
                        btn_reset
                        btn_assign_program
                        btn_view_student_card
                      }
                    }
                    follow_up {
                      show_perm
                      actions {
                        btn_assign_registration_profile
                        btn_admission_email
                        btn_send_email
                        btn_export
                        btn_assign_registration_profile_multiple
                        btn_admission_email_multiple
                        btn_send_email_multiple
                        btn_reset
                        btn_transfer_to_another_dev
                        btn_transfer_another_program
                        btn_view_student_card
                        btn_view_admission_file
                        btn_resend_registration_email
                        btn_edit_jury_decision
                        btn_send_reminder
                        btn_transfer_to_another_dev_multiple
                      }
                    }
                  }
                  form_follow_up {
                    show_perm
                    general_form_follow_up {
                      show_perm
                      edit_perm
                    }
                    admission_document_form_follow_up {
                      show_perm
                      edit_perm
                    }
                  }
                  teacher_management {
                    show_perm
                    teacher_follow_up {
                      show_perm
                      actions {
                        btn_generate_contract
                        btn_export
                        btn_view
                        btn_generate_contract_action
                      }
                    }
                    contract_process {
                      show_perm
                      actions {
                        btn_add_type_of_intervention
                        btn_export
                        btn_edit
                        btn_delete
                      }
                    }
                    teachers_table {
                      show_perm
                      actions {
                         btn_add_type_of_intervention
                         btn_export
                         btn_edit
                         btn_delete
                      }
                    }
                    contract_process {
                      show_perm
                      actions {
                        btn_add_type_of_intervention
                        btn_export
                        btn_edit
                        btn_delete
                      }
                    }
                  }
                  students {
                    show_perm
                    edit_perm
                    export {
                      show_perm
                    }
                    follow_up {
                      show_perm
                      edit_perm
                      actions {
                        btn_reset
                        btn_send_email
                        btn_assign_sequence
                        btn_export
                      }
                    }
                    trombinoscope {
                      show_perm
                      edit_perm
                      actions {
                        btn_reset
                        btn_filter
                        btn_export_pdf
                      }
                    }
                    all_students {
                      show_perm
                      edit_perm
                      actions {
                        btn_export
                        btn_reset
                        btn_send_email
                        btn_add_multiple_tags
                        btn_remove_multiple_tags
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      `,
      })
      .pipe(
        map((resp) => {
          return resp.data['loginAsUserIncognito'];
        }),
      );
  }

  autoLoginFromAuth(email: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query AutoLoginFromAuth{
        GetOneUser(email: "${email}") {
          _id
          civility
          first_name
          last_name
          email
          position
          office_phone
          direct_line
          portable_phone
          profile_picture
          student_id {
            _id
          }
          entities {
            school{
              _id
              short_name
            }
            campus{
              _id
              name
            }
            level{
              _id
              name
            }
            programs {
              school {
                _id
                short_name
              }
              campus {
                _id
                name
              }
              level {
                _id
                name
              }
            }
            entity_name
            school_type
            group_of_schools {
              _id
              short_name
            }
            group_of_school{
              _id
              headquarter {
                _id
                short_name
              }
              school_members {
                _id
                short_name
              }
            }
            school {
              _id
              short_name
            }
            assigned_rncp_title {
              _id
              short_name
            }
            class {
              _id
              name
            }
            type {
              _id
              name
              usertype_permission_id {
                _id
                user_type_name
                status
                quick_search {
                  show_perm
                  search_user
                  search_student
                  search_mentor
                  search_school
                  search_teacher
                  search_tag
                }
                companies {
                  show_perm
                  edit_perm
                  add_company
                  delete_perm
                  organization {
                    show_perm
                    add_organization {
                      show_perm
                    }
                    edit_organization {
                      show_perm
                    }
                    delete_organization {
                      show_perm
                    }
                    organization_details {
                      show_perm
                    }
                    contact {
                      show_perm
                      add_contact {
                        show_perm
                      }
                      edit_contact {
                        show_perm
                      }
                      delete_contact {
                        show_perm
                      }
                    }
                  }
                  company_details {
                    company_detail {
                      show_perm
                      revision_perm
                      edit_perm
                    }
                    company_staff {
                      show_perm
                      edit_perm
                      add_perm
                      actions {
                        edit_perm
                        send_email
                        delete_perm
                      }
                    }
                    connected_school {
                      show_perm
                      edit_perm
                      connect_school
                      actions {
                        connect_mentor_to_School
                        delete_perm
                      }
                    }
                  }
                  company_entity {
                    show_perm
                    edit_perm
                    edit_company {
                      show_perm
                      edit_perm
                    }
                    add_company {
                      show_perm
                      edit_perm
                    }
                    note {
                      add_note
                      edit_perm
                    }
                    history_company {
                      show_perm
                      edit_perm
                    }
                    note_company {
                      show_perm
                      edit_perm
                    }
                    member_company {
                      show_perm
                      edit_perm
                    }
                    branch_company {
                      show_perm
                      edit_perm
                    }
                    internship_company {
                      show_perm
                      edit_perm
                    }
                    connect_school {
                      show_perm
                      edit_perm
                    }
                  }
                  company_branch {
                    show_perm
                    edit_perm
                    edit_company {
                      show_perm
                      edit_perm
                    }
                    add_company {
                      show_perm
                      edit_perm
                    }
                    note {
                      add_note
                    }
                    history_company {
                      show_perm
                      edit_perm
                    }
                    note_company {
                      show_perm
                      edit_perm
                    }
                    member_company {
                      show_perm
                      edit_perm
                    }
                    branch_company {
                      show_perm
                      edit_perm
                    }
                    internship_company {
                      show_perm
                      edit_perm
                    }
                    connect_school {
                      show_perm
                      edit_perm
                    }
                    company_staff {
                      show_perm
                      edit_perm
                      add_perm
                      actions {
                        edit_perm
                        send_email
                        delete_perm
                      }
                    }
                  }
                  mentors {
                    show_perm
                  }
                }
                tasks {
                  show_perm
                  add_task
                  internal_task
                  add_test_task
                  actions {
                    delete_task
                    edit_perm
                  }
                }
                mailbox {
                  show_perm
                  edit_perm
                  inbox
                  sent
                  important
                  draft
                  trash
                  actions {
                    download_email
                    urgent_message
                    mail_to_group
                    compose
                    important
                    delete
                  }
                }
                users {
                  show_perm
                  edit_perm
                  add_perm
                  export
                  transfer_responsibility
                  actions {
                    incognito
                    error_email
                    delete_perm
                    edit_perm
                    send_email
                    reminder_reg_user
                    btn_transfer_another_dev
                    btn_transfer_another_program
                    btn_view_student_card
                    btn_view_admission_file
                    btn_resend_registration_email
                    btn_reset
                  }
                }
                tutorials {
                  show_perm
                  edit_perm
                  tutorial_table
                  add_perm
                  actions {
                    view_perm
                    edit_perm
                    delete_perm
                    send
                  }
                  inapp_tutorials {
                    show_perm
                    edit_perm
                    actions{
                      btn_add_tutorial
                      btn_reset
                      btn_delete_tutorial
                      btn_view_tutorial
                      btn_publish_tutorial
                    }
                  }
                }
                candidate {
                  commentaries {
                    actions{
                      btn_add_comment
                    }
                  }
                  student_card {
                    student_tag {
                      show_perm
                      edit_perm
                      actions {
                        btn_add_tag
                        btn_edit_perm
                      }
                    }
                  }
                  follow_up_contract {
                    edit_perm
                    show_perm
                    actions{
                      btn_add_contract
                      btn_send_email
                      btn_send_reminder
                      btn_view_student_card
                      btn_view_admission_contract
                    }
                  }
                  candidate_tab {
                    show_perm
                    edit_perm
                    connect_as
                  }
                  candidate_history {
                    show_perm
                    edit_perm
                  }
                  admission_member {
                    show_perm
                    edit_perm
                  }
                  mentor {
                    show_perm
                    edit_perm
                  }
                  my_note {
                    show_perm
                    edit_perm
                  }
                  oscar_campus {
                    show_perm
                    edit_perm
                    oscar_import_button {
                      show_perm
                      edit_perm
                    }
                    hubspot_import_button {
                      show_perm
                      edit_perm
                    }
                    actions {
                      btn_import
                      btn_assign_program
                      btn_get_oscar_student
                      btn_export
                      btn_reset
                    }
                  }
                  hubspot {
                    show_perm
                    edit_perm
                    oscar_import_button {
                      show_perm
                      edit_perm
                    }
                    hubspot_import_button {
                      show_perm
                    }
                    actions {
                      btn_assign_program
                      btn_get_hubspot_student
                      btn_export
                      btn_reset
                    }
                  }
                  follow_up_continuous {
                      show_perm
                      actions{
                        btn_crm_ok
                        btn_assign_registration_profile_multiple
                        btn_1st_call_done_multiple
                        btn_1st_email_of_annoucment_multiple
                        btn_transfer_to_another_dev_multiple
                        btn_send_email_multiple
                        btn_reset
                        btn_export_csv
                        btn_assign_registration_profile
                        btn_1st_email_of_annoucment
                        btn_1st_call_done
                        btn_send_email
                        btn_transfer_to_another_dev
                        btn_view_student_card
                        btn_view_admission_file
                        btn_resend_registration_email
                        btn_transfer_another_program
                      }
                    }
                  show_perm
                  edit_perm
                  actions {
                    report_inscription {
                      show_perm
                    }
                    btn_assign_registration_profile_multiple
                    btn_1st_call_done_multiple
                    btn_1st_email_of_annoucment_multiple
                    btn_transfer_to_another_dev
                    btn_crm_ok
                    btn_assign_registration_profile
                    btn_1st_call_done
                    btn_1st_email_of_annoucment
                    btn_transfer_to_another_dev_multiple
                    btn_send_email_multiple
                    btn_export_csv
                    btn_reset
                    btn_send_email
                    btn_transfer_another_program
                    btn_view_student_card
                    btn_view_admission_file
                    btn_resend_registration_email
                  }
                  edit_perm
                  candidate_dashboard {
                    show_perm
                    edit_perm
                  }
                }
                intake_channel {
                  intake_channel {
                    show_perm
                    edit_perm
                  }
                  scholar_season {
                    show_perm
                    edit_perm
                    actions{
                      btn_add_scholar_season
                      btn_reset
                      btn_publish
                      btn_edit
                      btn_delete
                    }
                  }
                  school {
                    show_perm
                    edit_perm
                    actions {
                      btn_delete_school
                      btn_edit_school
                      btn_add_school
                      btn_export_csv
                      btn_reset
                    }
                    program {
                      show_perm
                      edit_perm
                      actions{
                        btn_reset
                        btn_export_csv
                        btn_add_program
                        btn_delete_program
                      }
                    }
                    down_payment {
                      show_perm
                      edit_perm
                      actions {
                        btn_export_csv
                        btn_import_down_payment
                      }
                    }
                    full_rate {
                      show_perm
                      edit_perm
                      actions {
                        btn_export_csv
                        btn_import_full_rate
                      }
                    }
                    legal{
                      show_perm
                      edit_perm
                      actions {
                        btn_reset
                        btn_export_csv
                        btn_connect_legal_entity
                        btn_paid_allowance_rate
                        btn_induced_hours
                      }
                    }
                    admission{
                      show_perm
                      edit_perm
                      actions {
                        btn_reset
                        btn_export_csv
                        btn_add_condition_multiple
                        btn_remove_registration_profile
                        btn_add_registration_profile
                      }
                    }
                    course_sequence{
                      show_perm
                      edit_perm
                      actions {
                        btn_reset
                        btn_connect_template
                        btn_details
                      }
                    }
                  }
                  level {
                    show_perm
                    edit_perm
                    actions {
                      btn_edit
                      btn_delete
                      btn_add_level
                      btn_reset
                    }
                  }
                  sector {
                    show_perm
                    edit_perm
                    actions {
                      btn_edit_sector
                      btn_delete_sector
                      btn_add_sector
                      btn_export_csv
                      btn_reset
                    }
                  }
                  site {
                    show_perm
                    edit_perm
                    actions {
                      btn_edit
                      btn_delete
                      btn_add_site
                      btn_reset
                    }
                  }
                  campus {
                    show_perm
                    edit_perm
                    actions {
                      btn_pin
                      btn_edit
                      btn_delete
                      btn_add_site_campus
                    }
                  }
                  full_rate {
                    show_perm
                    edit_perm
                    actions {
                      btn_edit_mode
                      btn_import
                      btn_export
                    }
                  }
                  speciality {
                    show_perm
                    edit_perm
                    actions {
                      btn_delete_speciality
                      btn_edit_speciality
                      btn_add_speciality
                      btn_export_csv
                      btn_reset
                    }
                  }
                  payment_terms {
                    show_perm
                    edit_perm
                  }
                  pricing_profile {
                    show_perm
                    edit_perm
                  }
                  show_perm
                  edit_perm
                  setting {
                    show_perm
                    edit_perm
                    additional_expense {
                      show_perm
                      edit_perm
                      actions {
                        btn_add_additional_expense
                        btn_export_additional_expense
                        btn_edit_additional_expense
                        btn_delete_additional_expense
                        btn_reset
                      }
                    }
                    type_of_formation{
                      actions{
                        btn_reset
                        btn_export_csv
                        btn_add_type_of_formation
                        btn_edit_type_of_formation
                        btn_delete_type_of_formation
                      }
                    }
                    payment_mode {
                      actions{
                        btn_reset
                        btn_export_csv
                        btn_add_payment_mode
                        btn_edit_payment_mode
                        btn_delete_payment_mode
                      }
                    }
                    registration_profile {
                      actions{
                        btn_reset
                        btn_add_registration_profile
                        btn_edit
                        btn_delete
                        btn_add_export
                      }
                    }
                    legal_entities{
                      actions{
                        btn_reset
                        btn_export_csv
                        btn_add_legal_entity
                        btn_edit_legal_entity
                        btn_delete_legal_entity
                        btn_view_legal_entity
                        btn_publish_or_unpublish_legal_entity
                      }
                    }
                  }
                }
                setting {
                  user_permission {
                    show_perm
                  }
                  import_objective {
                    show_perm
                    edit_perm
                  }
                  import_objective_finance {
                    show_perm
                    edit_perm
                  }
                  import_finance_n1 {
                    show_perm
                    edit_perm
                  }
                  external_promotion {
                    show_perm
                    edit_perm
                    actions {
                      btn_delete_diapos_external
                      btn_edit_diapos_external
                      btn_add_diapos_external
                      btn_view_diapos_external
                      btn_send_email
                      btn_duplicate_diapos_external
                      btn_publish_diapos_external
                      btn_export_csv
                      btn_reset
                    }
                  }
                  message_step {
                    show_perm
                    edit_perm
                    actions {
                      btn_delete_message_step
                      btn_edit_message_step
                      btn_add_message_step
                      btn_view_message_step
                      btn_send_email
                      btn_duplicate_message_step
                      btn_publish_message_step
                      btn_export_csv
                      btn_reset
                    }
                  }
                  cels_segmentation {
                    show_perm
                    edit_perm
                  }
                  cels_action {
                    show_perm
                    edit_perm
                  }
                  notification_management {
                    show_perm
                    edit_perm
                    actions {
                      btn_edit_notification
                      btn_reset
                      btn_delete_template
                      btn_edit_template
                      btn_add_template
                      btn_view_template
                      btn_reset_template
                    }
                  }
                  show_perm
                  edit_perm
                }
                history {
                  notifications {
                    show_perm
                    actions {
                      btn_reset
                      btn_filter_today
                      btn_filter_yesterday
                      btn_filter_last_7_days
                      btn_filter_last_30_days
                      btn_view_notification
                    }
                  }
                  show_perm
                }
                finance {
                  unbalanced_balance {
                    show_perm
                    edit_perm
                    actions {
                      btn_export
                      btn_reset
                      send_school_contract_amendment
                    }
                  }
                  operation_lines {
                    show_perm
                    edit_perm
                    not_exported {
                      show_perm
                      edit_perm
                      actions {
                        export_sage
                        export_lines_to_export
                        export_lines_exported
                        export_all_lines
                        btn_reset
                      }
                    }
                    exported {
                      show_perm
                      edit_perm
                      btn_reset
                    }
                  }
                  timeline_template{
                    show_perm
                    create_timeline_template{
                      show_perm
                    }
                    edit_timeline_template{
                      show_perm
                    }
                    delete_timeline_template{
                      show_perm
                    }
                  }
                  general {
                    show_perm
                    edit_perm
                  }
                  cash_in {
                    show_perm
                    edit_perm
                  }
                  payment {
                    show_perm
                    edit_perm
                  }
                  follow_up {
                    show_perm
                    edit_perm
                    actions {
                      btn_generate_billing
                      btn_send_mail_multiple
                      add_payment
                      btn_view_student_card
                      btn_edit_term
                      btn_send_email
                      btn_export
                      btn_reset
                      btn_asking_payment
                    }
                  }
                  member {
                    show_perm
                    edit_perm
                  }
                  history {
                    show_perm
                    edit_perm
                    actions {
                      btn_reconciliation
                      btn_lettrage
                      btn_see_student_file
                      btn_create_internal_task
                      btn_send_email
                      btn_export_csv
                      btn_reset
                      btn_filter_today
                      btn_filter_yesterday
                      btn_filter_last_7_days
                      btn_filter_last_30_days
                      btn_filter_this_month
                    }
                  }
                  reconciliation_letterage {
                    show_perm
                    edit_perm
                  }
                  cheque {
                    show_perm
                    edit_perm
                  }
                  transaction_report {
                    show_perm
                    edit_perm
                    actions {
                      btn_export_csv
                      btn_reset
                      btn_filter_today
                      btn_filter_yesterday
                      btn_filter_last_7_days
                      btn_filter_last_30_days
                      btn_view_transaction_detail
                    }
                  }
                  balance_report {
                    show_perm
                    edit_perm
                    actions {
                      btn_export_csv
                      btn_reset
                      btn_filter_today
                      btn_filter_yesterday
                      btn_filter_last_7_days
                      btn_filter_last_30_days
                      btn_view_transaction_detail
                    }
                  }
                  follow_up_organization {
                    show_perm
                    edit_perm
                    actions{
                      btn_generate_billing
                      btn_send_mail_multiple
                      btn_assign_timeline_multiple
                      btn_export
                      btn_reset
                      btn_send_email
                      add_payment
                      btn_view_student_card
                      btn_edit_term
                      btn_assign_timeline
                    }
                  }
                  master_table_transaction {
                    show_perm
                    actions {
                      btn_export
                      btn_view_transaction
                      btn_view_detail
                      btn_view_student_card
                    }
                  }
                  show_perm
                  edit_perm
                }
                alumni {
                  follow_up {
                    show_perm
                    edit_perm
                    actions {
                      btn_export
                      btn_send_survey
                      btn_reset
                      btn_send_survey_multiple
                      btn_send_email
                      btn_view_alumni_card
                    }
                  }
                  member {
                    show_perm
                    edit_perm
                  }
                  card {
                    show_perm
                    edit_perm
                    actions {
                      btn_add_alumni
                      btn_reset
                      btn_add_comment
                      btn_save_identity
                      btn_history_export
                    }
                  }
                  trombinoscope {
                    show_perm
                    edit_perm
                  }
                  show_perm
                  edit_perm
                }
                internship {
                  internship_posting {
                    show_perm
                    edit_perm
                  }
                  internship_profile {
                    show_perm
                    edit_perm
                  }
                  candidature {
                    show_perm
                    edit_perm
                  }
                  agreement {
                    show_perm
                    edit_perm
                  }
                  show_perm
                  follow_up {
                    show_perm
                    edit_perm
                  }
                  setting {
                    show_perm
                  }
                  user {
                    show_perm
                  }
                  edit_perm
                }
                contracts {
                  show_perm
                  edit_perm
                  contract_process {
                    show_perm
                    edit_perm
                    actions {
                      btn_send_the_form
                      btn_template_for_import
                      btn_import_contract
                      btn_new_contract
                      btn_reset
                      btn_go_to_form
                      btn_edit_contract
                      btn_send_reminder
                      btn_send_email
                      btn_additional_document
                      btn_remove_contract
                    }
                  }
                }
                process {
                  show_perm
                  edit_perm
                  document {
                    show_perm
                    edit_perm
                    actions {
                      btn_add_template
                      btn_reset
                      btn_edit
                      btn_delete_template
                      btn_duplicate_template
                    }
                  }
                  form_builder {
                    show_perm
                    edit_perm
                    actions {
                      btn_add_template
                      btn_reset
                      btn_delete_template
                      btn_edit_template
                      btn_duplicate_template
                    }
                  }
                  alumni_survey {
                    show_perm
                    edit_perm
                  }
                }
                courses_sequences {
                  show_perm
                  edit_perm
                  btn_export {
                    show_perm
                  }
                  btn_reset {
                    show_perm
                  }
                  btn_add_subject {
                    show_perm
                  }
                  template{
                      create_perm
                      edit_perm
                      show_perm
                      export_perm
                      actions{
                        btn_reset
                        btn_delete
                        btn_duplicate
                      }
                    }
                    sequence{
                      create_perm
                      edit_perm
                      show_perm
                      export_perm
                      actions{
                        btn_reset
                        btn_delete
                        btn_duplicate
                      }
                    }
                    module{
                      create_perm
                      edit_perm
                      show_perm
                      export_perm
                      actions{
                        btn_reset
                        btn_delete
                        btn_template_import
                        btn_import_module
                      }
                    }
                    subject{
                      create_perm
                      edit_perm
                      show_perm
                      export_perm
                      actions{
                        btn_template_import
                        btn_import_subject
                        btn_reset
                        btn_delete
                      }
                    }
                }
                readmission {
                  show_perm
                  assignment {
                    show_perm
                    actions {
                      btn_edit_jury_decision
                      btn_edit_program_desired
                      btn_assign_program
                      btn_send_email
                      btn_export
                      btn_financial_situation
                      btn_template_import
                      btn_import_file
                      btn_assign_program_multiple
                      btn_reset
                      btn_assign_program
                      btn_view_student_card
                    }
                  }
                  follow_up {
                    show_perm
                    actions {
                      btn_assign_registration_profile
                      btn_admission_email
                      btn_send_email
                      btn_export
                      btn_assign_registration_profile_multiple
                      btn_admission_email_multiple
                      btn_send_email_multiple
                      btn_reset
                      btn_transfer_to_another_dev
                      btn_transfer_another_program
                      btn_view_student_card
                      btn_view_admission_file
                      btn_resend_registration_email
                      btn_edit_jury_decision
                      btn_send_reminder
                      btn_transfer_to_another_dev_multiple
                    }
                  }
                }
                students {
                  show_perm
                  edit_perm
                  export {
                    show_perm
                  }
                  follow_up {
                    show_perm
                    edit_perm
                    actions {
                      btn_reset
                      btn_send_email
                      btn_assign_sequence
                      btn_export
                    }
                  }
                  trombinoscope {
                    show_perm
                    edit_perm
                    actions {
                      btn_reset
                      btn_filter
                      btn_export_pdf
                    }
                  }
                  all_students {
                    show_perm
                    edit_perm
                    actions {
                      btn_export
                      btn_reset
                      btn_send_email
                      btn_add_multiple_tags
                      btn_remove_multiple_tags
                    }
                  }
                }
                form_follow_up {
                  show_perm
                  general_form_follow_up {
                    show_perm
                    edit_perm
                  }
                  admission_document_form_follow_up {
                    show_perm
                    edit_perm
                  }
                }
                teacher_management {
                  show_perm
                  teacher_follow_up {
                    show_perm
                    actions {
                      btn_generate_contract
                      btn_export
                      btn_view
                      btn_generate_contract_action
                    }
                  }
                  contract_process {
                    show_perm
                    actions {
                      btn_add_type_of_intervention
                      btn_export
                      btn_edit
                      btn_delete
                    }
                  }
                  teachers_table {
                    show_perm
                    actions {
                       btn_add_type_of_intervention
                       btn_export
                       btn_edit
                       btn_delete
                    }
                  }
                }
              }
            }
          }
        }
      }
      `,
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneUser'];
        }),
      );
  }

  GetUserTableColumnSettings(user_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetUserTableColumnSettings($user_id: ID!) {
            GetUserTableColumnSettings(user_id: $user_id) {
              table_name
              display_column {
                column_name
              }
              filter_column
            }
          }
        `,
        variables: {
          user_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetUserTableColumnSettings']));
  }

  CreateOrUpdateUserTableColumnSettings(user_id, input_table_setting): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateOrUpdateUserTableColumnSettings($input_table_setting: InputTableSetting, $user_id: ID) {
            CreateOrUpdateUserTableColumnSettings(user_id: $user_id, input_table_setting: $input_table_setting) {
              table_name
              display_column {
                column_name
              }
              filter_column
            }
          }
        `,
        variables: {
          user_id,
          input_table_setting,
        },
      })
      .pipe(map((resp) => resp.data['CreateOrUpdateUserTableColumnSettings']));
  }

  editChatbotConversationFlow(session_id, current_page): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation CheckSessionDialogFlow($sessionInput: CheckSessionDialogFlowInput) {
          CheckSessionDialogFlow(session_input: $sessionInput)
        }
        `,
        variables: {
          sessionInput: {
            "current_page": current_page,
            "session_id": session_id
          }
        },
      })
      .pipe(map((resp) => resp.data['CheckSessionDialogFlow']));
  }

  refreshTemplateTables(user_id) {
    this.subs.sink = this.GetUserTableColumnSettings(user_id).subscribe(
      (resp) => {
        if (resp && resp?.length) {
          localStorage.setItem('templateTable', JSON.stringify(resp));
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: 'Warning',
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  isUserOPERATORAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('userProfile'));
    let isADMTCADMIN = false;
    if (currentUser && currentUser.entities && currentUser.entities.length) {
      for (const entity of currentUser.entities) {
        console.log(entity);
        if (entity && entity.type && entity.type.name === 'operator_admin') {
          isADMTCADMIN = true;
          break;
        }
      }
    }
    return isADMTCADMIN;
  }

  getUserEntity() {
    const currentUser = JSON.parse(localStorage.getItem('userProfile'));
    let entityName = '';
    if (currentUser && currentUser.entities && currentUser.entities.length) {
      for (const entity of currentUser.entities) {
        entityName = entity.entity_name;
        break;
      }
    }
    return entityName;
  }

  checkLinkStatus(token): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation CheckLinkStatus{
          CheckLinkStatus(token: "${token}")
          }
        `,
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }
  postErrorLog(msg: string) {
    msg = JSON.stringify(msg);
    const exceptionList = [
      '0 Unknown Error',
      'Password Not Valid',
      'Invalid Password',
      'invalid signature',
      'jwt expired',
      'Authorization header is missing',
      'str & salt required',
      'UnAuthenticated',
      'salt',
    ];
    let isException = false;
    if (msg) {
      for (const exception of exceptionList) {
        if (msg.includes(exception)) {
          isException = true;
          break;
        }
      }
    }
    console.log('cek postErrorlog', isException);

    if (!isException) {
      let currentUser = localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')) : null;
      const packages = require('../../../../package.json');
      currentUser = currentUser && currentUser._id ? currentUser : null;
      const payload = {
        environment: environment.apiUrl,
        first_name: currentUser ? currentUser.first_name : '',
        last_name: currentUser ? currentUser.last_name : '',
        civility: currentUser ? currentUser.civility : '',
        email: currentUser ? currentUser.email : '',
        operating_system: OSNameADMTC,
        browser_name: browserNameADMTC,
        version: packages.version,
        url: locationUrl,
        error_message: msg,
      };
      console.log('==================================| Error |==================================');
      console.log('postErrorLog', payload);
      if (environment.apiUrl === 'https://api.erp-edh.com/graphql') {
        this.httpClient.post<any>(`https://zetta-track.click/saveErrorLogEDH`, payload).subscribe((data) => {
          console.log('resp postErrorLog', data);
        });
      }
      console.log('==================================| Error |==================================');
    }
  }
}
