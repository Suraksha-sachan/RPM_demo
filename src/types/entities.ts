import { DecodedIdToken } from 'firebase-admin/auth';

interface IBase {
  createdAt?: Date;
  updatedAt?: Date;
}

interface IBaseWithId extends IBase {
  id: string;
}

export enum ROLES {
  ADMIN = 'admin',
  MA = 'ma',
  DOCTOR = 'doctor',
  SUPER_ADMIN = 'superAdmin',
}

export const USER_ROLES_BY_ACCESS_LEVEL = {
  // values are access level where 0 is simple user and 3 super admin
  [ROLES.MA]: 0,
  [ROLES.DOCTOR]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3,
};

export enum CONTACT_POINT {
  PHONE = 'phone',
  EMAIL = 'email',
  FAX = 'fax',
}

export interface IProvider<
  T = IHumanName,
  TContactPoint = string,
  TClient = string,
> extends IBaseWithId {
  humanName: T;
  providerContactPoints: TContactPoint[];
  emailVerified: boolean;
  photo: string;
  active: boolean;
  role: ROLES;
  client: TClient;
  email: string;
  npi: number;
}

export enum ACTIONS {
  HEALTH_GOALS_CREATED = 'healthGoalsCreated',
  HEALTH_GOALS_UPDATED = 'healthGoalsUpdated',
  HEALTH_GOALS_DELETED = 'healthGoalsDeleted',
  PROVIDER_CREATED = 'providerCreated',
  PROVIDER_UPDATED = 'providerUpdated',
  PROVIDER_DELETED = 'providerDeleted',
  VITALS_CREATED = 'vitalsCreated',
  VITALS_UPDATED = 'vitalsUpdated',
  VITALS_DELETED = 'vitalsDeleted',
  CLIENT_CREATED = 'clientCreated',
  CLIENT_UPDATED = 'clientUpdated',
  CLIENT_DELETED = 'clientDeleted',
  PATIENT_CREATED = 'patientCreated',
  PATIENT_UPDATED = 'patientUpdated',
  PATIENT_DELETED = 'patientDeleted',
  DEVICE_ASSIGN = 'deviceAssign',
  DEVICE_UNASSIGN = 'deviceUnassign',
  REPORT_GENERATION = 'reportGeneration',
  LOGIN = 'login',
  GET_VR_REPORT = 'getVrReport',
  GET_SR_REPORT = 'getSrReport',
}

export enum ENTITY {
  PATIENT = 'patient',
  PROVIDER = 'provider',
  CLIENT = 'client',
  VITAL = 'vital',
  HEALTH_GOAL = 'healthGoal',
}
export enum ENTITY_USER_TYPE {
  PATIENT = 'patient',
  PROVIDER = 'provider',
}
export enum AUDIT_STATUS {
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum AUDIT_GROUPS {
  LOGIN = 'login',
  API = 'api',
  REPORTS = 'reports',
}

export interface IAudit extends IBaseWithId {
  action: ACTIONS;
  credentials: string; //email, phone
  status: AUDIT_STATUS; //success, error
  params: string; // request with params (for reports)
  entityType: ENTITY; //type of entity that was edited, created
  entity: string; // id edited entity
  entityUserType: ENTITY_USER_TYPE; // who made action type
  entityUser: string; // who made action id
  newValues: string; //new values - delta of changed data
  prevValues: string;
  auditGroup: AUDIT_GROUPS;
}

export interface IHumanName extends IBaseWithId {
  text: string;
  given: string;
  family: string;
}

export interface IClient<TClientRepresentative = string, TAddress = string>
  extends IBaseWithId {
  title: string;
  address: TAddress;
  clientRepresentative: TClientRepresentative[];
}

export interface IClientRepresentative<
  T = string,
  TClientRepresentativeContactPoints = string,
> extends IBaseWithId {
  client: string;
  humanName: T;
  clientRepresentativeContactPoints: TClientRepresentativeContactPoints[];
  position: string | null;
}

export interface IClientRepresentativeContactPoint<
  TContactPoint = IContactPoint,
  TClientRepresentative = IClientRepresentative,
> extends IBaseWithId {
  contactPoint: TContactPoint | string;
  clientRepresentative: TClientRepresentative | string;
}

export interface IProviderContactPoint<
  TContactPoint = string,
  TProvider = string,
> extends IBaseWithId {
  contactPoint: TContactPoint;
  provider: TProvider;
}

export interface IContactPoint extends IBaseWithId {
  text: string;
  type: CONTACT_POINT;
}

export interface IAddress extends IBaseWithId {
  text: string;
  line: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface IZipCode {
  id: number;
  zipCode: number;
  primaryCity: string;
  state: string;
}

export type ClientFullType = IClient<
  IClientRepresentative<
    IHumanName,
    IClientRepresentativeContactPoint<IContactPoint>
  >,
  IAddress
>;

export type DeviceProvidedByType = 'personal' | 'none';

export type HealthConditionsType =
  | 'chf'
  | 'diabetes'
  | 'stroke'
  | 'copd'
  | 'cardiovascular'
  | 'hypertension'
  | 'depression'
  | 'alzheimer/dementia'
  | 'ckd'
  | 'text';

export type ServicesType = 'ccm' | 'prm' | 'cde' | 'mht' | 'mh';
export type GadgetDeviceType = 'android' | 'ios';
export type GenderType = 'female' | 'male' | 'unknown';
export type InsuranceType =
  | 'medicare'
  | 'advantage'
  | 'medicaid'
  | 'private'
  | 'self-pay';
export interface IPatient<
  TAssets = string,
  TAdress = string,
  THumanName = string,
  TPatientContactPoint = string,
  TClient = string,
> extends IBaseWithId {
  assets: TAssets[];
  address: TAdress;
  humanName: THumanName;
  patientContactPoints: TPatientContactPoint[];
  dateOfBirth: string;
  healthCondition: string;
  services: string;
  programName?: string;
  device: GadgetDeviceType;
  deceased: boolean;
  height?: number;
  active: boolean;
  gender: GenderType;
  insuranceT: InsuranceType;
  phone: string;
  client: TClient;
  patientDevices: IPatientDevice[];
}

export interface IAsset<TPatientAssets = string> extends IBaseWithId {
  type: 'image' | 'document';
  path: string;
  location: string;
  eTag: string;
  patientAssets: TPatientAssets;
}

export interface IPatientAsset<TPatient = string, TAsset = string>
  extends IBaseWithId {
  patient: TPatient;
  asset: TAsset;
}

export interface IPatientContactPoint<
  TPatient = string,
  TContactPoint = string,
> {
  patient: TPatient;
  contactPoint: TContactPoint;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IFullPatient
  extends IPatient<
    IPatientAsset<string, IAsset>,
    IAddress,
    IHumanName,
    IPatientContactPoint<IPatient, IContactPoint>,
    IClient
  > {}

export enum DEVICE_TYPE {
  DEVICE_T = 'deviceT',
  DEVICE_BP = 'deviceBP',
  DEVICE_SC = 'deviceSC',
  DEVICE_GL = 'deviceGL',
  DEVICE_PO = 'devicePO', //cellular
  DEVICE_T_CELLULAR = 'deviceTCellular',
  DEVICE_BP_CELLULAR = 'deviceBPCellular',
  DEVICE_SC_CELLULAR = 'deviceSCellular',
  DEVICE_GL_CELLULAR = 'deviceGLCellular',
  DEVICE_PO_CELLULAR = 'devicePOCellular',
}

export enum VITAL_TYPE {
  BLOOD_PRESSURE = 'bloodPressure',
  GLUCOSE = 'glucose',
  WEIGHT = 'weight',
  TEMPERATURE = 'temperature',
  OXYGEN_SATURATION = 'oxygenSaturation',
}
export enum CIRCUMSTANCES {
  FASTING = 'fasting',
  BEFORE_MEAL = 'beforeMeal',
  BEFORE_EXERCISES = 'beforeExercises',
  BEDTIME = 'bedtime',
}
export interface IVital<
  TPatient = string,
  TMeasurement = string,
  TVitalNote = string,
> extends IBaseWithId {
  deviceType: DEVICE_TYPE;
  patient: TPatient;
  isAlert: boolean;
  isCleared: boolean;
  isDeleted: boolean;
  isManually: boolean;
  takenAt: string;
  measurements: TMeasurement[];
  type: VITAL_TYPE;
  circumstances: CIRCUMSTANCES;
  vitalNote?: TVitalNote;
}

export interface IFullVital
  extends IVital<IPatient<string, string, string, string, IClient>, IVital> {
  patient: IPatient<string, string, string, string, IClient>;
}

export interface IPatientDevice<TPatient = string> extends IBaseWithId {
  patient: TPatient;
  type: DEVICE_TYPE;
  providedBy: DeviceProvidedByType;
  identifier: string;
  simNumber: string;
}

export interface IFullProvider
  extends IProvider<IHumanName, IProviderContactPoint<IContactPoint>, IClient> {
  client: IClient;
}

export type UserEntity = Partial<
  | IProvider<string, string, IClient>
  | IPatient<string, string, string, string, IClient>
> & {
  entityType?: ENTITY_USER_TYPE;
};
export type DecodedUser = DecodedIdToken & Partial<UserEntity>;

export interface IMeasurement<TVital = string> extends IBaseWithId {
  vital: TVital;
  type: MEASUREMENT_TYPE;
  value: number;
  unitOfMeasurement: string; // kg for example
}

export enum MEASUREMENT_TYPE {
  BODY_SCALE = 'bodyScale',
  BLOOD_PRESSURE_SYS = 'bloodPressureSYS', //
  BLOOD_PRESSURE_HB = 'bloodPressureHB', //
  BLOOD_PRESSURE_DIA = 'bloodPressureDIA', //
  BLOOD_GLUCOSE_BG = 'bloodGlucoseBG', //
  THERMOMETER_C = 'thermometerC', //
  PULSE_OXIMETER_O = 'pulseOximeterO', //
}

export interface IHealthGoal<TPatient = string> extends IBaseWithId {
  borderLineMin: number;
  normalMinThreshold: number;
  normalHight: number;
  borderlineHight: number;
  patient: TPatient;
  measurementType: MEASUREMENT_TYPE;
  circumstances: CIRCUMSTANCES;
}

export interface IJournalNote extends IBaseWithId {
  patient: string;
  title: string;
  details: string;
  vitalNote: string;
}

export interface IVitalNote<TVital = string, TJournalNote = string> {
  vital: TVital;
  journalNote: TJournalNote;
}

export interface IDeviceToken<TPatient = string> extends IBaseWithId {
  patient: TPatient;
  token: string;
}

export interface INotification<TPatient = string> extends IBaseWithId {
  type: NOTIFICATION_TYPE;
  body: string;
  title: string;
  patient: TPatient;
  isRead: boolean;
}

export enum NOTIFICATION_TYPE {
  EXCEPT_MEASUREMENTS = 'exceptMeasurements',
  ABNORMAL_VITALS = 'abnormalVitals',
}
