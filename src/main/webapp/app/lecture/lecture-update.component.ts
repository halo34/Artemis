import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { LectureService } from './lecture.service';
import { CourseManagementService } from '../course/manage/course-management.service';
import { Lecture } from 'app/entities/lecture.model';
import { EditorMode } from 'app/shared/markdown-editor/markdown-editor.component';
import { Course } from 'app/entities/course.model';
import { KatexCommand } from 'app/shared/markdown-editor/commands/katex.command';
import { onError } from 'app/shared/util/global.utils';
import { ArtemisNavigationUtilService } from 'app/utils/navigation.utils';
import { DocumentationType } from 'app/shared/components/documentation-button/documentation-button.component';
import { faBan, faHandshakeAngle, faPuzzlePiece, faSave } from '@fortawesome/free-solid-svg-icons';
import { LectureUpdateWizardComponent } from 'app/lecture/wizard-mode/lecture-update-wizard.component';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FILE_EXTENSIONS } from 'app/shared/constants/file-extensions.constants';

@Component({
    selector: 'jhi-lecture-update',
    templateUrl: './lecture-update.component.html',
    styleUrls: ['./lecture-update.component.scss'],
})
export class LectureUpdateComponent implements OnInit {
    documentationType = DocumentationType.Lecture;

    @ViewChild(LectureUpdateWizardComponent, { static: false }) wizardComponent: LectureUpdateWizardComponent;

    EditorMode = EditorMode;
    lecture: Lecture;
    isSaving: boolean;
    isProcessing: boolean;
    processUnitMode: boolean;
    isShowingWizardMode: boolean;

    courses: Course[];
    startDate: string;
    endDate: string;

    domainCommandsDescription = [new KatexCommand()];
    file: File;
    fileName: string;
    fileInputTouched = false;

    // Icons
    faQuestionCircle = faQuestionCircle;
    faSave = faSave;
    faPuzzleProcess = faPuzzlePiece;
    faBan = faBan;
    faHandShakeAngle = faHandshakeAngle;

    // A human-readable list of allowed file extensions
    readonly allowedFileExtensions = FILE_EXTENSIONS.join(', ');
    // The list of file extensions for the "accept" attribute of the file input field
    readonly acceptedFileExtensionsFileBrowser = FILE_EXTENSIONS.map((ext) => '.' + ext).join(',');

    toggleModeFunction = () => this.toggleWizardMode();
    saveLectureFunction = () => this.save();

    constructor(
        protected alertService: AlertService,
        protected lectureService: LectureService,
        protected courseService: CourseManagementService,
        protected activatedRoute: ActivatedRoute,
        private navigationUtilService: ArtemisNavigationUtilService,
        private router: Router,
    ) {}

    /**
     * Life cycle hook called by Angular to indicate that Angular is done creating the component
     */
    ngOnInit() {
        this.isSaving = false;
        this.processUnitMode = false;
        this.isProcessing = false;
        this.isShowingWizardMode = false;
        this.activatedRoute.parent!.data.subscribe((data) => {
            // Create a new lecture to use unless we fetch an existing lecture
            const lecture = data['lecture'];
            this.lecture = lecture ?? new Lecture();

            const course = data['course'];
            if (course) {
                this.lecture.course = course;
            }
        });

        this.activatedRoute.queryParams.subscribe((params) => {
            if (params.shouldBeInWizardMode) {
                this.isShowingWizardMode = params.shouldBeInWizardMode;
            }
        });
    }

    /**
     * Revert to the previous state, equivalent with pressing the back button on your browser
     * Returns to the detail page if there is no previous state and we edited an existing lecture
     * Returns to the overview page if there is no previous state and we created a new lecture
     */
    previousState() {
        this.navigationUtilService.navigateBackWithOptional(['course-management', this.lecture.course!.id!.toString(), 'lectures'], this.lecture.id?.toString());
    }

    /**
     * Save the changes on a lecture
     * This function is called by pressing save after creating or editing a lecture
     */
    save() {
        this.isSaving = true;
        this.isProcessing = true;
        if (this.lecture.id !== undefined) {
            this.subscribeToSaveResponse(this.lectureService.update(this.lecture));
        } else {
            this.subscribeToSaveResponse(this.lectureService.create(this.lecture));
        }
    }

    /**
     * Activate or deactivate the wizard mode for easier lecture creation.
     * This function is called by pressing "Switch to guided mode" when creating a new lecture
     */
    toggleWizardMode() {
        this.isShowingWizardMode = !this.isShowingWizardMode;
    }

    proceedToUnitSplit() {
        this.save();
    }

    /**
     * Activate or deactivate the processUnitMode mode for automatic lecture units creation.
     * This function is called by checking Automatic unit processing checkbox when creating a new lecture
     */
    onSelectProcessUnit() {
        this.processUnitMode = !this.processUnitMode;
    }

    onFileChange(event: any): void {
        if (event.target.files.length) {
            const fileList = event.target.files;
            this.file = fileList[0];
            this.fileName = this.file.name;
        } else {
            this.fileName = '';
        }
    }

    /**
     * @callback Callback function after saving a lecture, handles appropriate action in case of error
     * @param result The Http response from the server
     */
    protected subscribeToSaveResponse(result: Observable<HttpResponse<Lecture>>) {
        result.subscribe({
            next: (response: HttpResponse<Lecture>) => this.onSaveSuccess(response.body!),
            error: (error: HttpErrorResponse) => this.onSaveError(error),
        });
    }

    /**
     * Action on successful lecture creation or edit
     */
    protected onSaveSuccess(lecture: Lecture) {
        if (this.isShowingWizardMode && !this.lecture.id) {
            this.lectureService.findWithDetails(lecture.id!).subscribe({
                next: (response: HttpResponse<Lecture>) => {
                    this.isSaving = false;
                    this.lecture = response.body!;
                    this.alertService.success(`Lecture with title ${lecture.title} was successfully created.`);
                    this.wizardComponent.onLectureCreationSucceeded();
                },
            });
        } else if (this.processUnitMode) {
            this.isSaving = false;
            this.isProcessing = false;
            this.alertService.success(`Lecture with title ${lecture.title} was successfully ${this.lecture.id !== undefined ? 'updated' : 'created'}.`);
            this.router.navigate(['course-management', lecture.course!.id, 'lectures', lecture.id, 'unit-management', 'attachment-units', 'process'], {
                state: { file: this.file, fileName: this.fileName },
            });
        } else {
            this.isSaving = false;
            this.router.navigate(['course-management', lecture.course!.id, 'lectures', lecture.id]);
        }
    }

    /**
     * Action on unsuccessful lecture creation or edit
     * @param error the error handed to the alert service
     */
    protected onSaveError(error: HttpErrorResponse) {
        this.isSaving = false;
        onError(this.alertService, error);
    }

    onDatesValuesChanged() {
        if (this.lecture.startDate === undefined || this.lecture.endDate === undefined) {
            return;
        }

        if (this.lecture.startDate.isSameOrBefore(this.lecture.endDate)) {
            return;
        }

        this.lecture.endDate = this.lecture.startDate;
    }
}
