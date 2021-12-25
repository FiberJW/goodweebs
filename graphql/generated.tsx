import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** ISO 3166-1 alpha-2 country code */
  CountryCode: any;
  /** 8 digit long date integer (YYYYMMDD). Unknown dates represented by 0. E.g. 2016: 20160000, May 1976: 19760500 */
  FuzzyDateInt: any;
  Json: any;
};

/** Notification for when a activity is liked */
export type ActivityLikeNotification = {
  __typename?: 'ActivityLikeNotification';
  /** The liked activity */
  activity?: Maybe<ActivityUnion>;
  /** The id of the activity which was liked */
  activityId: Scalars['Int'];
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The user who liked the activity */
  user?: Maybe<User>;
  /** The id of the user who liked to the activity */
  userId: Scalars['Int'];
};

/** Notification for when authenticated user is @ mentioned in activity or reply */
export type ActivityMentionNotification = {
  __typename?: 'ActivityMentionNotification';
  /** The liked activity */
  activity?: Maybe<ActivityUnion>;
  /** The id of the activity where mentioned */
  activityId: Scalars['Int'];
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The user who mentioned the authenticated user */
  user?: Maybe<User>;
  /** The id of the user who mentioned the authenticated user */
  userId: Scalars['Int'];
};

/** Notification for when a user is send an activity message */
export type ActivityMessageNotification = {
  __typename?: 'ActivityMessageNotification';
  /** The id of the activity message */
  activityId: Scalars['Int'];
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The message activity */
  message?: Maybe<MessageActivity>;
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The user who sent the message */
  user?: Maybe<User>;
  /** The if of the user who send the message */
  userId: Scalars['Int'];
};

/** Replay to an activity item */
export type ActivityReply = {
  __typename?: 'ActivityReply';
  /** The id of the parent activity */
  activityId?: Maybe<Scalars['Int']>;
  /** The time the reply was created at */
  createdAt: Scalars['Int'];
  /** The id of the reply */
  id: Scalars['Int'];
  /** If the currently authenticated user liked the reply */
  isLiked?: Maybe<Scalars['Boolean']>;
  /** The amount of likes the reply has */
  likeCount: Scalars['Int'];
  /** The users who liked the reply */
  likes?: Maybe<Array<Maybe<User>>>;
  /** The reply text */
  text?: Maybe<Scalars['String']>;
  /** The user who created reply */
  user?: Maybe<User>;
  /** The id of the replies creator */
  userId?: Maybe<Scalars['Int']>;
};


/** Replay to an activity item */
export type ActivityReplyTextArgs = {
  asHtml?: Maybe<Scalars['Boolean']>;
};

/** Notification for when a activity reply is liked */
export type ActivityReplyLikeNotification = {
  __typename?: 'ActivityReplyLikeNotification';
  /** The liked activity */
  activity?: Maybe<ActivityUnion>;
  /** The id of the activity where the reply which was liked */
  activityId: Scalars['Int'];
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The user who liked the activity reply */
  user?: Maybe<User>;
  /** The id of the user who liked to the activity reply */
  userId: Scalars['Int'];
};

/** Notification for when a user replies to the authenticated users activity */
export type ActivityReplyNotification = {
  __typename?: 'ActivityReplyNotification';
  /** The liked activity */
  activity?: Maybe<ActivityUnion>;
  /** The id of the activity which was replied too */
  activityId: Scalars['Int'];
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The user who replied to the activity */
  user?: Maybe<User>;
  /** The id of the user who replied to the activity */
  userId: Scalars['Int'];
};

/** Notification for when a user replies to activity the authenticated user has replied to */
export type ActivityReplySubscribedNotification = {
  __typename?: 'ActivityReplySubscribedNotification';
  /** The liked activity */
  activity?: Maybe<ActivityUnion>;
  /** The id of the activity which was replied too */
  activityId: Scalars['Int'];
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The user who replied to the activity */
  user?: Maybe<User>;
  /** The id of the user who replied to the activity */
  userId: Scalars['Int'];
};

/** Activity sort enums */
export enum ActivitySort {
  Id = 'ID',
  IdDesc = 'ID_DESC'
}

/** Activity type enum. */
export enum ActivityType {
  /** A anime list update activity */
  AnimeList = 'ANIME_LIST',
  /** A manga list update activity */
  MangaList = 'MANGA_LIST',
  /** Anime & Manga list update, only used in query arguments */
  MediaList = 'MEDIA_LIST',
  /** A text message activity sent to another user */
  Message = 'MESSAGE',
  /** A text activity */
  Text = 'TEXT'
}

/** Activity union type */
export type ActivityUnion = ListActivity | MessageActivity | TextActivity;

/** Notification for when an episode of anime airs */
export type AiringNotification = {
  __typename?: 'AiringNotification';
  /** The id of the aired anime */
  animeId: Scalars['Int'];
  /** The notification context text */
  contexts?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The episode number that just aired */
  episode: Scalars['Int'];
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The associated media of the airing schedule */
  media?: Maybe<Media>;
  /** The type of notification */
  type?: Maybe<NotificationType>;
};

/** Score & Watcher stats for airing anime by episode and mid-week */
export type AiringProgression = {
  __typename?: 'AiringProgression';
  /** The episode the stats were recorded at. .5 is the mid point between 2 episodes airing dates. */
  episode?: Maybe<Scalars['Float']>;
  /** The average score for the media */
  score?: Maybe<Scalars['Float']>;
  /** The amount of users watching the anime */
  watching?: Maybe<Scalars['Int']>;
};

/** Media Airing Schedule. NOTE: We only aim to guarantee that FUTURE airing data is present and accurate. */
export type AiringSchedule = {
  __typename?: 'AiringSchedule';
  /** The time the episode airs at */
  airingAt: Scalars['Int'];
  /** The airing episode number */
  episode: Scalars['Int'];
  /** The id of the airing schedule item */
  id: Scalars['Int'];
  /** The associate media of the airing episode */
  media?: Maybe<Media>;
  /** The associate media id of the airing episode */
  mediaId: Scalars['Int'];
  /** Seconds until episode starts airing */
  timeUntilAiring: Scalars['Int'];
};

export type AiringScheduleConnection = {
  __typename?: 'AiringScheduleConnection';
  edges?: Maybe<Array<Maybe<AiringScheduleEdge>>>;
  nodes?: Maybe<Array<Maybe<AiringSchedule>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** AiringSchedule connection edge */
export type AiringScheduleEdge = {
  __typename?: 'AiringScheduleEdge';
  /** The id of the connection */
  id?: Maybe<Scalars['Int']>;
  node?: Maybe<AiringSchedule>;
};

export type AiringScheduleInput = {
  airingAt?: Maybe<Scalars['Int']>;
  episode?: Maybe<Scalars['Int']>;
  timeUntilAiring?: Maybe<Scalars['Int']>;
};

/** Airing schedule sort enums */
export enum AiringSort {
  Episode = 'EPISODE',
  EpisodeDesc = 'EPISODE_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  MediaId = 'MEDIA_ID',
  MediaIdDesc = 'MEDIA_ID_DESC',
  Time = 'TIME',
  TimeDesc = 'TIME_DESC'
}

export type AniChartHighlightInput = {
  highlight?: Maybe<Scalars['String']>;
  mediaId?: Maybe<Scalars['Int']>;
};

export type AniChartUser = {
  __typename?: 'AniChartUser';
  highlights?: Maybe<Scalars['Json']>;
  settings?: Maybe<Scalars['Json']>;
  user?: Maybe<User>;
};

/** A character that features in an anime or manga */
export type Character = {
  __typename?: 'Character';
  /** The character's age. Note this is a string, not an int, it may contain further text and additional ages. */
  age?: Maybe<Scalars['String']>;
  /** The characters blood type */
  bloodType?: Maybe<Scalars['String']>;
  /** The character's birth date */
  dateOfBirth?: Maybe<FuzzyDate>;
  /** A general description of the character */
  description?: Maybe<Scalars['String']>;
  /** The amount of user's who have favourited the character */
  favourites?: Maybe<Scalars['Int']>;
  /** The character's gender. Usually Male, Female, or Non-binary but can be any string. */
  gender?: Maybe<Scalars['String']>;
  /** The id of the character */
  id: Scalars['Int'];
  /** Character images */
  image?: Maybe<CharacterImage>;
  /** If the character is marked as favourite by the currently authenticated user */
  isFavourite: Scalars['Boolean'];
  /** If the character is blocked from being added to favourites */
  isFavouriteBlocked: Scalars['Boolean'];
  /** Media that includes the character */
  media?: Maybe<MediaConnection>;
  /** Notes for site moderators */
  modNotes?: Maybe<Scalars['String']>;
  /** The names of the character */
  name?: Maybe<CharacterName>;
  /** The url for the character page on the AniList website */
  siteUrl?: Maybe<Scalars['String']>;
  /** @deprecated No data available */
  updatedAt?: Maybe<Scalars['Int']>;
};


/** A character that features in an anime or manga */
export type CharacterDescriptionArgs = {
  asHtml?: Maybe<Scalars['Boolean']>;
};


/** A character that features in an anime or manga */
export type CharacterMediaArgs = {
  onList?: Maybe<Scalars['Boolean']>;
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<MediaSort>>>;
  type?: Maybe<MediaType>;
};

export type CharacterConnection = {
  __typename?: 'CharacterConnection';
  edges?: Maybe<Array<Maybe<CharacterEdge>>>;
  nodes?: Maybe<Array<Maybe<Character>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Character connection edge */
export type CharacterEdge = {
  __typename?: 'CharacterEdge';
  /** The order the character should be displayed from the users favourites */
  favouriteOrder?: Maybe<Scalars['Int']>;
  /** The id of the connection */
  id?: Maybe<Scalars['Int']>;
  /** The media the character is in */
  media?: Maybe<Array<Maybe<Media>>>;
  /** Media specific character name */
  name?: Maybe<Scalars['String']>;
  node?: Maybe<Character>;
  /** The characters role in the media */
  role?: Maybe<CharacterRole>;
  /** The voice actors of the character with role date */
  voiceActorRoles?: Maybe<Array<Maybe<StaffRoleType>>>;
  /** The voice actors of the character */
  voiceActors?: Maybe<Array<Maybe<Staff>>>;
};


/** Character connection edge */
export type CharacterEdgeVoiceActorRolesArgs = {
  language?: Maybe<StaffLanguage>;
  sort?: Maybe<Array<Maybe<StaffSort>>>;
};


/** Character connection edge */
export type CharacterEdgeVoiceActorsArgs = {
  language?: Maybe<StaffLanguage>;
  sort?: Maybe<Array<Maybe<StaffSort>>>;
};

export type CharacterImage = {
  __typename?: 'CharacterImage';
  /** The character's image of media at its largest size */
  large?: Maybe<Scalars['String']>;
  /** The character's image of media at medium size */
  medium?: Maybe<Scalars['String']>;
};

/** The names of the character */
export type CharacterName = {
  __typename?: 'CharacterName';
  /** Other names the character might be referred to as */
  alternative?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Other names the character might be referred to as but are spoilers */
  alternativeSpoiler?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The character's given name */
  first?: Maybe<Scalars['String']>;
  /** The character's first and last name */
  full?: Maybe<Scalars['String']>;
  /** The character's surname */
  last?: Maybe<Scalars['String']>;
  /** The character's middle name */
  middle?: Maybe<Scalars['String']>;
  /** The character's full name in their native language */
  native?: Maybe<Scalars['String']>;
  /** The currently authenticated users preferred name language. Default romaji for non-authenticated */
  userPreferred?: Maybe<Scalars['String']>;
};

/** The names of the character */
export type CharacterNameInput = {
  /** Other names the character might be referred by */
  alternative?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Other names the character might be referred to as but are spoilers */
  alternativeSpoiler?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The character's given name */
  first?: Maybe<Scalars['String']>;
  /** The character's surname */
  last?: Maybe<Scalars['String']>;
  /** The character's middle name */
  middle?: Maybe<Scalars['String']>;
  /** The character's full name in their native language */
  native?: Maybe<Scalars['String']>;
};

/** The role the character plays in the media */
export enum CharacterRole {
  /** A background character in the media */
  Background = 'BACKGROUND',
  /** A primary character role in the media */
  Main = 'MAIN',
  /** A supporting character role in the media */
  Supporting = 'SUPPORTING'
}

/** Character sort enums */
export enum CharacterSort {
  Favourites = 'FAVOURITES',
  FavouritesDesc = 'FAVOURITES_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  /** Order manually decided by moderators */
  Relevance = 'RELEVANCE',
  Role = 'ROLE',
  RoleDesc = 'ROLE_DESC',
  SearchMatch = 'SEARCH_MATCH'
}

/** A submission for a character that features in an anime or manga */
export type CharacterSubmission = {
  __typename?: 'CharacterSubmission';
  /** Data Mod assigned to handle the submission */
  assignee?: Maybe<User>;
  /** Character that the submission is referencing */
  character?: Maybe<Character>;
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the submission */
  id: Scalars['Int'];
  /** Whether the submission is locked */
  locked?: Maybe<Scalars['Boolean']>;
  /** Inner details of submission status */
  notes?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
  /** Status of the submission */
  status?: Maybe<SubmissionStatus>;
  /** The character submission changes */
  submission?: Maybe<Character>;
  /** Submitter for the submission */
  submitter?: Maybe<User>;
};

export type CharacterSubmissionConnection = {
  __typename?: 'CharacterSubmissionConnection';
  edges?: Maybe<Array<Maybe<CharacterSubmissionEdge>>>;
  nodes?: Maybe<Array<Maybe<CharacterSubmission>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** CharacterSubmission connection edge */
export type CharacterSubmissionEdge = {
  __typename?: 'CharacterSubmissionEdge';
  node?: Maybe<CharacterSubmission>;
  /** The characters role in the media */
  role?: Maybe<CharacterRole>;
  /** The submitted voice actors of the character */
  submittedVoiceActors?: Maybe<Array<Maybe<StaffSubmission>>>;
  /** The voice actors of the character */
  voiceActors?: Maybe<Array<Maybe<Staff>>>;
};


/** Deleted data type */
export type Deleted = {
  __typename?: 'Deleted';
  /** If an item has been successfully deleted */
  deleted?: Maybe<Scalars['Boolean']>;
};

/** User's favourite anime, manga, characters, staff & studios */
export type Favourites = {
  __typename?: 'Favourites';
  /** Favourite anime */
  anime?: Maybe<MediaConnection>;
  /** Favourite characters */
  characters?: Maybe<CharacterConnection>;
  /** Favourite manga */
  manga?: Maybe<MediaConnection>;
  /** Favourite staff */
  staff?: Maybe<StaffConnection>;
  /** Favourite studios */
  studios?: Maybe<StudioConnection>;
};


/** User's favourite anime, manga, characters, staff & studios */
export type FavouritesAnimeArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
};


/** User's favourite anime, manga, characters, staff & studios */
export type FavouritesCharactersArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
};


/** User's favourite anime, manga, characters, staff & studios */
export type FavouritesMangaArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
};


/** User's favourite anime, manga, characters, staff & studios */
export type FavouritesStaffArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
};


/** User's favourite anime, manga, characters, staff & studios */
export type FavouritesStudiosArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
};

/** Notification for when the authenticated user is followed by another user */
export type FollowingNotification = {
  __typename?: 'FollowingNotification';
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The liked activity */
  user?: Maybe<User>;
  /** The id of the user who followed the authenticated user */
  userId: Scalars['Int'];
};

/** User's format statistics */
export type FormatStats = {
  __typename?: 'FormatStats';
  amount?: Maybe<Scalars['Int']>;
  format?: Maybe<MediaFormat>;
};

/** Date object that allows for incomplete date values (fuzzy) */
export type FuzzyDate = {
  __typename?: 'FuzzyDate';
  /** Numeric Day (24) */
  day?: Maybe<Scalars['Int']>;
  /** Numeric Month (3) */
  month?: Maybe<Scalars['Int']>;
  /** Numeric Year (2017) */
  year?: Maybe<Scalars['Int']>;
};

/** Date object that allows for incomplete date values (fuzzy) */
export type FuzzyDateInput = {
  /** Numeric Day (24) */
  day?: Maybe<Scalars['Int']>;
  /** Numeric Month (3) */
  month?: Maybe<Scalars['Int']>;
  /** Numeric Year (2017) */
  year?: Maybe<Scalars['Int']>;
};


/** User's genre statistics */
export type GenreStats = {
  __typename?: 'GenreStats';
  amount?: Maybe<Scalars['Int']>;
  genre?: Maybe<Scalars['String']>;
  meanScore?: Maybe<Scalars['Int']>;
  /** The amount of time in minutes the genre has been watched by the user */
  timeWatched?: Maybe<Scalars['Int']>;
};

/** Page of data (Used for internal use only) */
export type InternalPage = {
  __typename?: 'InternalPage';
  activities?: Maybe<Array<Maybe<ActivityUnion>>>;
  activityReplies?: Maybe<Array<Maybe<ActivityReply>>>;
  airingSchedules?: Maybe<Array<Maybe<AiringSchedule>>>;
  characters?: Maybe<Array<Maybe<Character>>>;
  characterSubmissions?: Maybe<Array<Maybe<CharacterSubmission>>>;
  followers?: Maybe<Array<Maybe<User>>>;
  following?: Maybe<Array<Maybe<User>>>;
  likes?: Maybe<Array<Maybe<User>>>;
  media?: Maybe<Array<Maybe<Media>>>;
  mediaList?: Maybe<Array<Maybe<MediaList>>>;
  mediaSubmissions?: Maybe<Array<Maybe<MediaSubmission>>>;
  mediaTrends?: Maybe<Array<Maybe<MediaTrend>>>;
  modActions?: Maybe<Array<Maybe<ModAction>>>;
  notifications?: Maybe<Array<Maybe<NotificationUnion>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
  recommendations?: Maybe<Array<Maybe<Recommendation>>>;
  reports?: Maybe<Array<Maybe<Report>>>;
  reviews?: Maybe<Array<Maybe<Review>>>;
  revisionHistory?: Maybe<Array<Maybe<RevisionHistory>>>;
  staff?: Maybe<Array<Maybe<Staff>>>;
  staffSubmissions?: Maybe<Array<Maybe<StaffSubmission>>>;
  studios?: Maybe<Array<Maybe<Studio>>>;
  threadComments?: Maybe<Array<Maybe<ThreadComment>>>;
  threads?: Maybe<Array<Maybe<Thread>>>;
  userBlockSearch?: Maybe<Array<Maybe<User>>>;
  users?: Maybe<Array<Maybe<User>>>;
};


/** Page of data (Used for internal use only) */
export type InternalPageActivitiesArgs = {
  createdAt?: Maybe<Scalars['Int']>;
  createdAt_greater?: Maybe<Scalars['Int']>;
  createdAt_lesser?: Maybe<Scalars['Int']>;
  hasReplies?: Maybe<Scalars['Boolean']>;
  hasRepliesOrTypeText?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isFollowing?: Maybe<Scalars['Boolean']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not?: Maybe<Scalars['Int']>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  messengerId?: Maybe<Scalars['Int']>;
  messengerId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  messengerId_not?: Maybe<Scalars['Int']>;
  messengerId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  sort?: Maybe<Array<Maybe<ActivitySort>>>;
  type?: Maybe<ActivityType>;
  type_in?: Maybe<Array<Maybe<ActivityType>>>;
  type_not?: Maybe<ActivityType>;
  type_not_in?: Maybe<Array<Maybe<ActivityType>>>;
  userId?: Maybe<Scalars['Int']>;
  userId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  userId_not?: Maybe<Scalars['Int']>;
  userId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
};


/** Page of data (Used for internal use only) */
export type InternalPageActivityRepliesArgs = {
  activityId?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageAiringSchedulesArgs = {
  airingAt?: Maybe<Scalars['Int']>;
  airingAt_greater?: Maybe<Scalars['Int']>;
  airingAt_lesser?: Maybe<Scalars['Int']>;
  episode?: Maybe<Scalars['Int']>;
  episode_greater?: Maybe<Scalars['Int']>;
  episode_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  episode_lesser?: Maybe<Scalars['Int']>;
  episode_not?: Maybe<Scalars['Int']>;
  episode_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not?: Maybe<Scalars['Int']>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  notYetAired?: Maybe<Scalars['Boolean']>;
  sort?: Maybe<Array<Maybe<AiringSort>>>;
};


/** Page of data (Used for internal use only) */
export type InternalPageCharactersArgs = {
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isBirthday?: Maybe<Scalars['Boolean']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<CharacterSort>>>;
};


/** Page of data (Used for internal use only) */
export type InternalPageCharacterSubmissionsArgs = {
  assigneeId?: Maybe<Scalars['Int']>;
  characterId?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<SubmissionSort>>>;
  status?: Maybe<SubmissionStatus>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageFollowersArgs = {
  sort?: Maybe<Array<Maybe<UserSort>>>;
  userId: Scalars['Int'];
};


/** Page of data (Used for internal use only) */
export type InternalPageFollowingArgs = {
  sort?: Maybe<Array<Maybe<UserSort>>>;
  userId: Scalars['Int'];
};


/** Page of data (Used for internal use only) */
export type InternalPageLikesArgs = {
  likeableId?: Maybe<Scalars['Int']>;
  type?: Maybe<LikeableType>;
};


/** Page of data (Used for internal use only) */
export type InternalPageMediaArgs = {
  averageScore?: Maybe<Scalars['Int']>;
  averageScore_greater?: Maybe<Scalars['Int']>;
  averageScore_lesser?: Maybe<Scalars['Int']>;
  averageScore_not?: Maybe<Scalars['Int']>;
  chapters?: Maybe<Scalars['Int']>;
  chapters_greater?: Maybe<Scalars['Int']>;
  chapters_lesser?: Maybe<Scalars['Int']>;
  countryOfOrigin?: Maybe<Scalars['CountryCode']>;
  duration?: Maybe<Scalars['Int']>;
  duration_greater?: Maybe<Scalars['Int']>;
  duration_lesser?: Maybe<Scalars['Int']>;
  endDate?: Maybe<Scalars['FuzzyDateInt']>;
  endDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
  endDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  endDate_like?: Maybe<Scalars['String']>;
  episodes?: Maybe<Scalars['Int']>;
  episodes_greater?: Maybe<Scalars['Int']>;
  episodes_lesser?: Maybe<Scalars['Int']>;
  format?: Maybe<MediaFormat>;
  format_in?: Maybe<Array<Maybe<MediaFormat>>>;
  format_not?: Maybe<MediaFormat>;
  format_not_in?: Maybe<Array<Maybe<MediaFormat>>>;
  genre?: Maybe<Scalars['String']>;
  genre_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  genre_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  idMal?: Maybe<Scalars['Int']>;
  idMal_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  idMal_not?: Maybe<Scalars['Int']>;
  idMal_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isAdult?: Maybe<Scalars['Boolean']>;
  isLicensed?: Maybe<Scalars['Boolean']>;
  licensedBy?: Maybe<Scalars['String']>;
  licensedBy_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  minimumTagRank?: Maybe<Scalars['Int']>;
  onList?: Maybe<Scalars['Boolean']>;
  popularity?: Maybe<Scalars['Int']>;
  popularity_greater?: Maybe<Scalars['Int']>;
  popularity_lesser?: Maybe<Scalars['Int']>;
  popularity_not?: Maybe<Scalars['Int']>;
  search?: Maybe<Scalars['String']>;
  season?: Maybe<MediaSeason>;
  seasonYear?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<MediaSort>>>;
  source?: Maybe<MediaSource>;
  source_in?: Maybe<Array<Maybe<MediaSource>>>;
  startDate?: Maybe<Scalars['FuzzyDateInt']>;
  startDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
  startDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  startDate_like?: Maybe<Scalars['String']>;
  status?: Maybe<MediaStatus>;
  status_in?: Maybe<Array<Maybe<MediaStatus>>>;
  status_not?: Maybe<MediaStatus>;
  status_not_in?: Maybe<Array<Maybe<MediaStatus>>>;
  tag?: Maybe<Scalars['String']>;
  tag_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tag_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tagCategory?: Maybe<Scalars['String']>;
  tagCategory_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tagCategory_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  type?: Maybe<MediaType>;
  volumes?: Maybe<Scalars['Int']>;
  volumes_greater?: Maybe<Scalars['Int']>;
  volumes_lesser?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageMediaListArgs = {
  compareWithAuthList?: Maybe<Scalars['Boolean']>;
  completedAt?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_like?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  isFollowing?: Maybe<Scalars['Boolean']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  notes?: Maybe<Scalars['String']>;
  notes_like?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<MediaListSort>>>;
  startedAt?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_like?: Maybe<Scalars['String']>;
  status?: Maybe<MediaListStatus>;
  status_in?: Maybe<Array<Maybe<MediaListStatus>>>;
  status_not?: Maybe<MediaListStatus>;
  status_not_in?: Maybe<Array<Maybe<MediaListStatus>>>;
  type?: Maybe<MediaType>;
  userId?: Maybe<Scalars['Int']>;
  userId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  userName?: Maybe<Scalars['String']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageMediaSubmissionsArgs = {
  assigneeId?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<SubmissionSort>>>;
  status?: Maybe<SubmissionStatus>;
  submissionId?: Maybe<Scalars['Int']>;
  type?: Maybe<MediaType>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageMediaTrendsArgs = {
  averageScore?: Maybe<Scalars['Int']>;
  averageScore_greater?: Maybe<Scalars['Int']>;
  averageScore_lesser?: Maybe<Scalars['Int']>;
  averageScore_not?: Maybe<Scalars['Int']>;
  date?: Maybe<Scalars['Int']>;
  date_greater?: Maybe<Scalars['Int']>;
  date_lesser?: Maybe<Scalars['Int']>;
  episode?: Maybe<Scalars['Int']>;
  episode_greater?: Maybe<Scalars['Int']>;
  episode_lesser?: Maybe<Scalars['Int']>;
  episode_not?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not?: Maybe<Scalars['Int']>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  popularity?: Maybe<Scalars['Int']>;
  popularity_greater?: Maybe<Scalars['Int']>;
  popularity_lesser?: Maybe<Scalars['Int']>;
  popularity_not?: Maybe<Scalars['Int']>;
  releasing?: Maybe<Scalars['Boolean']>;
  sort?: Maybe<Array<Maybe<MediaTrendSort>>>;
  trending?: Maybe<Scalars['Int']>;
  trending_greater?: Maybe<Scalars['Int']>;
  trending_lesser?: Maybe<Scalars['Int']>;
  trending_not?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageModActionsArgs = {
  modId?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageNotificationsArgs = {
  resetNotificationCount?: Maybe<Scalars['Boolean']>;
  type?: Maybe<NotificationType>;
  type_in?: Maybe<Array<Maybe<NotificationType>>>;
};


/** Page of data (Used for internal use only) */
export type InternalPageRecommendationsArgs = {
  id?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaRecommendationId?: Maybe<Scalars['Int']>;
  onList?: Maybe<Scalars['Boolean']>;
  rating?: Maybe<Scalars['Int']>;
  rating_greater?: Maybe<Scalars['Int']>;
  rating_lesser?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<RecommendationSort>>>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageReportsArgs = {
  reportedId?: Maybe<Scalars['Int']>;
  reporterId?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageReviewsArgs = {
  id?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaType?: Maybe<MediaType>;
  sort?: Maybe<Array<Maybe<ReviewSort>>>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageRevisionHistoryArgs = {
  characterId?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  staffId?: Maybe<Scalars['Int']>;
  studioId?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageStaffArgs = {
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isBirthday?: Maybe<Scalars['Boolean']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<StaffSort>>>;
};


/** Page of data (Used for internal use only) */
export type InternalPageStaffSubmissionsArgs = {
  assigneeId?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<SubmissionSort>>>;
  staffId?: Maybe<Scalars['Int']>;
  status?: Maybe<SubmissionStatus>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageStudiosArgs = {
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<StudioSort>>>;
};


/** Page of data (Used for internal use only) */
export type InternalPageThreadCommentsArgs = {
  id?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<ThreadCommentSort>>>;
  threadId?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageThreadsArgs = {
  categoryId?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaCategoryId?: Maybe<Scalars['Int']>;
  replyUserId?: Maybe<Scalars['Int']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<ThreadSort>>>;
  subscribed?: Maybe<Scalars['Boolean']>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageUserBlockSearchArgs = {
  search?: Maybe<Scalars['String']>;
};


/** Page of data (Used for internal use only) */
export type InternalPageUsersArgs = {
  id?: Maybe<Scalars['Int']>;
  isModerator?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<UserSort>>>;
};


/** Types that can be liked */
export enum LikeableType {
  Activity = 'ACTIVITY',
  ActivityReply = 'ACTIVITY_REPLY',
  Thread = 'THREAD',
  ThreadComment = 'THREAD_COMMENT'
}

/** Likeable union type */
export type LikeableUnion = ActivityReply | ListActivity | MessageActivity | TextActivity | Thread | ThreadComment;

/** User list activity (anime & manga updates) */
export type ListActivity = {
  __typename?: 'ListActivity';
  /** The time the activity was created at */
  createdAt: Scalars['Int'];
  /** The id of the activity */
  id: Scalars['Int'];
  /** If the currently authenticated user liked the activity */
  isLiked?: Maybe<Scalars['Boolean']>;
  /** If the activity is locked and can receive replies */
  isLocked?: Maybe<Scalars['Boolean']>;
  /** If the currently authenticated user is subscribed to the activity */
  isSubscribed?: Maybe<Scalars['Boolean']>;
  /** The amount of likes the activity has */
  likeCount: Scalars['Int'];
  /** The users who liked the activity */
  likes?: Maybe<Array<Maybe<User>>>;
  /** The associated media to the activity update */
  media?: Maybe<Media>;
  /** The list progress made */
  progress?: Maybe<Scalars['String']>;
  /** The written replies to the activity */
  replies?: Maybe<Array<Maybe<ActivityReply>>>;
  /** The number of activity replies */
  replyCount: Scalars['Int'];
  /** The url for the activity page on the AniList website */
  siteUrl?: Maybe<Scalars['String']>;
  /** The list item's textual status */
  status?: Maybe<Scalars['String']>;
  /** The type of activity */
  type?: Maybe<ActivityType>;
  /** The owner of the activity */
  user?: Maybe<User>;
  /** The user id of the activity's creator */
  userId?: Maybe<Scalars['Int']>;
};

/** User's list score statistics */
export type ListScoreStats = {
  __typename?: 'ListScoreStats';
  meanScore?: Maybe<Scalars['Int']>;
  standardDeviation?: Maybe<Scalars['Int']>;
};

/** Anime or Manga */
export type Media = {
  __typename?: 'Media';
  /** The media's entire airing schedule */
  airingSchedule?: Maybe<AiringScheduleConnection>;
  /** If the media should have forum thread automatically created for it on airing episode release */
  autoCreateForumThread?: Maybe<Scalars['Boolean']>;
  /** A weighted average score of all the user's scores of the media */
  averageScore?: Maybe<Scalars['Int']>;
  /** The banner image of the media */
  bannerImage?: Maybe<Scalars['String']>;
  /** The amount of chapters the manga has when complete */
  chapters?: Maybe<Scalars['Int']>;
  /** The characters in the media */
  characters?: Maybe<CharacterConnection>;
  /** Where the media was created. (ISO 3166-1 alpha-2) */
  countryOfOrigin?: Maybe<Scalars['CountryCode']>;
  /** The cover images of the media */
  coverImage?: Maybe<MediaCoverImage>;
  /** Short description of the media's story and characters */
  description?: Maybe<Scalars['String']>;
  /** The general length of each anime episode in minutes */
  duration?: Maybe<Scalars['Int']>;
  /** The last official release date of the media */
  endDate?: Maybe<FuzzyDate>;
  /** The amount of episodes the anime has when complete */
  episodes?: Maybe<Scalars['Int']>;
  /** External links to another site related to the media */
  externalLinks?: Maybe<Array<Maybe<MediaExternalLink>>>;
  /** The amount of user's who have favourited the media */
  favourites?: Maybe<Scalars['Int']>;
  /** The format the media was released in */
  format?: Maybe<MediaFormat>;
  /** The genres of the media */
  genres?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Official Twitter hashtags for the media */
  hashtag?: Maybe<Scalars['String']>;
  /** The id of the media */
  id: Scalars['Int'];
  /** The mal id of the media */
  idMal?: Maybe<Scalars['Int']>;
  /** If the media is intended only for 18+ adult audiences */
  isAdult?: Maybe<Scalars['Boolean']>;
  /** If the media is marked as favourite by the current authenticated user */
  isFavourite: Scalars['Boolean'];
  /** If the media is blocked from being added to favourites */
  isFavouriteBlocked: Scalars['Boolean'];
  /** If the media is officially licensed or a self-published doujin release */
  isLicensed?: Maybe<Scalars['Boolean']>;
  /** Locked media may not be added to lists our favorited. This may be due to the entry pending for deletion or other reasons. */
  isLocked?: Maybe<Scalars['Boolean']>;
  /** If the media is blocked from being recommended to/from */
  isRecommendationBlocked?: Maybe<Scalars['Boolean']>;
  /** Mean score of all the user's scores of the media */
  meanScore?: Maybe<Scalars['Int']>;
  /** The authenticated user's media list entry for the media */
  mediaListEntry?: Maybe<MediaList>;
  /** Notes for site moderators */
  modNotes?: Maybe<Scalars['String']>;
  /** The media's next episode airing schedule */
  nextAiringEpisode?: Maybe<AiringSchedule>;
  /** The number of users with the media on their list */
  popularity?: Maybe<Scalars['Int']>;
  /** The ranking of the media in a particular time span and format compared to other media */
  rankings?: Maybe<Array<Maybe<MediaRank>>>;
  /** User recommendations for similar media */
  recommendations?: Maybe<RecommendationConnection>;
  /** Other media in the same or connecting franchise */
  relations?: Maybe<MediaConnection>;
  /** User reviews of the media */
  reviews?: Maybe<ReviewConnection>;
  /** The season the media was initially released in */
  season?: Maybe<MediaSeason>;
  /**
   * The year & season the media was initially released in
   * @deprecated 
   */
  seasonInt?: Maybe<Scalars['Int']>;
  /** The season year the media was initially released in */
  seasonYear?: Maybe<Scalars['Int']>;
  /** The url for the media page on the AniList website */
  siteUrl?: Maybe<Scalars['String']>;
  /** Source type the media was adapted from. */
  source?: Maybe<MediaSource>;
  /** The staff who produced the media */
  staff?: Maybe<StaffConnection>;
  /** The first official release date of the media */
  startDate?: Maybe<FuzzyDate>;
  stats?: Maybe<MediaStats>;
  /** The current releasing status of the media */
  status?: Maybe<MediaStatus>;
  /** Data and links to legal streaming episodes on external sites */
  streamingEpisodes?: Maybe<Array<Maybe<MediaStreamingEpisode>>>;
  /** The companies who produced the media */
  studios?: Maybe<StudioConnection>;
  /** Alternative titles of the media */
  synonyms?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** List of tags that describes elements and themes of the media */
  tags?: Maybe<Array<Maybe<MediaTag>>>;
  /** The official titles of the media in various languages */
  title?: Maybe<MediaTitle>;
  /** Media trailer or advertisement */
  trailer?: Maybe<MediaTrailer>;
  /** The amount of related activity in the past hour */
  trending?: Maybe<Scalars['Int']>;
  /** The media's daily trend stats */
  trends?: Maybe<MediaTrendConnection>;
  /** The type of the media; anime or manga */
  type?: Maybe<MediaType>;
  /** When the media's data was last updated */
  updatedAt?: Maybe<Scalars['Int']>;
  /** The amount of volumes the manga has when complete */
  volumes?: Maybe<Scalars['Int']>;
};


/** Anime or Manga */
export type MediaAiringScheduleArgs = {
  notYetAired?: Maybe<Scalars['Boolean']>;
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
};


/** Anime or Manga */
export type MediaCharactersArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  role?: Maybe<CharacterRole>;
  sort?: Maybe<Array<Maybe<CharacterSort>>>;
};


/** Anime or Manga */
export type MediaDescriptionArgs = {
  asHtml?: Maybe<Scalars['Boolean']>;
};


/** Anime or Manga */
export type MediaRecommendationsArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<RecommendationSort>>>;
};


/** Anime or Manga */
export type MediaReviewsArgs = {
  limit?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<ReviewSort>>>;
};


/** Anime or Manga */
export type MediaSourceArgs = {
  version?: Maybe<Scalars['Int']>;
};


/** Anime or Manga */
export type MediaStaffArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<StaffSort>>>;
};


/** Anime or Manga */
export type MediaStatusArgs = {
  version?: Maybe<Scalars['Int']>;
};


/** Anime or Manga */
export type MediaStudiosArgs = {
  isMain?: Maybe<Scalars['Boolean']>;
  sort?: Maybe<Array<Maybe<StudioSort>>>;
};


/** Anime or Manga */
export type MediaTrendsArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  releasing?: Maybe<Scalars['Boolean']>;
  sort?: Maybe<Array<Maybe<MediaTrendSort>>>;
};

/** Internal - Media characters separated */
export type MediaCharacter = {
  __typename?: 'MediaCharacter';
  /** The characters in the media voiced by the parent actor */
  character?: Maybe<Character>;
  /** Media specific character name */
  characterName?: Maybe<Scalars['String']>;
  dubGroup?: Maybe<Scalars['String']>;
  /** The id of the connection */
  id?: Maybe<Scalars['Int']>;
  /** The characters role in the media */
  role?: Maybe<CharacterRole>;
  roleNotes?: Maybe<Scalars['String']>;
  /** The voice actor of the character */
  voiceActor?: Maybe<Staff>;
};

export type MediaConnection = {
  __typename?: 'MediaConnection';
  edges?: Maybe<Array<Maybe<MediaEdge>>>;
  nodes?: Maybe<Array<Maybe<Media>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

export type MediaCoverImage = {
  __typename?: 'MediaCoverImage';
  /** Average #hex color of cover image */
  color?: Maybe<Scalars['String']>;
  /** The cover image url of the media at its largest size. If this size isn't available, large will be provided instead. */
  extraLarge?: Maybe<Scalars['String']>;
  /** The cover image url of the media at a large size */
  large?: Maybe<Scalars['String']>;
  /** The cover image url of the media at medium size */
  medium?: Maybe<Scalars['String']>;
};

/** Notification for when a media entry's data was changed in a significant way impacting users' list tracking */
export type MediaDataChangeNotification = {
  __typename?: 'MediaDataChangeNotification';
  /** The reason for the media data change */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The media that received data changes */
  media?: Maybe<Media>;
  /** The id of the media that received data changes */
  mediaId: Scalars['Int'];
  /** The reason for the media data change */
  reason?: Maybe<Scalars['String']>;
  /** The type of notification */
  type?: Maybe<NotificationType>;
};

/** Notification for when a media tracked in a user's list is deleted from the site */
export type MediaDeletionNotification = {
  __typename?: 'MediaDeletionNotification';
  /** The reason for the media deletion */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The title of the deleted media */
  deletedMediaTitle?: Maybe<Scalars['String']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The reason for the media deletion */
  reason?: Maybe<Scalars['String']>;
  /** The type of notification */
  type?: Maybe<NotificationType>;
};

/** Media connection edge */
export type MediaEdge = {
  __typename?: 'MediaEdge';
  /** Media specific character name */
  characterName?: Maybe<Scalars['String']>;
  /** The characters role in the media */
  characterRole?: Maybe<CharacterRole>;
  /** The characters in the media voiced by the parent actor */
  characters?: Maybe<Array<Maybe<Character>>>;
  /** Used for grouping roles where multiple dubs exist for the same language. Either dubbing company name or language variant. */
  dubGroup?: Maybe<Scalars['String']>;
  /** The order the media should be displayed from the users favourites */
  favouriteOrder?: Maybe<Scalars['Int']>;
  /** The id of the connection */
  id?: Maybe<Scalars['Int']>;
  /** If the studio is the main animation studio of the media (For Studio->MediaConnection field only) */
  isMainStudio: Scalars['Boolean'];
  node?: Maybe<Media>;
  /** The type of relation to the parent model */
  relationType?: Maybe<MediaRelation>;
  /** Notes regarding the VA's role for the character */
  roleNotes?: Maybe<Scalars['String']>;
  /** The role of the staff member in the production of the media */
  staffRole?: Maybe<Scalars['String']>;
  /** The voice actors of the character with role date */
  voiceActorRoles?: Maybe<Array<Maybe<StaffRoleType>>>;
  /** The voice actors of the character */
  voiceActors?: Maybe<Array<Maybe<Staff>>>;
};


/** Media connection edge */
export type MediaEdgeRelationTypeArgs = {
  version?: Maybe<Scalars['Int']>;
};


/** Media connection edge */
export type MediaEdgeVoiceActorRolesArgs = {
  language?: Maybe<StaffLanguage>;
  sort?: Maybe<Array<Maybe<StaffSort>>>;
};


/** Media connection edge */
export type MediaEdgeVoiceActorsArgs = {
  language?: Maybe<StaffLanguage>;
  sort?: Maybe<Array<Maybe<StaffSort>>>;
};

/** An external link to another site related to the media */
export type MediaExternalLink = {
  __typename?: 'MediaExternalLink';
  /** The id of the external link */
  id: Scalars['Int'];
  /** The site location of the external link */
  site: Scalars['String'];
  /** The url of the external link */
  url: Scalars['String'];
};

/** An external link to another site related to the media */
export type MediaExternalLinkInput = {
  /** The id of the external link */
  id: Scalars['Int'];
  /** The site location of the external link */
  site: Scalars['String'];
  /** The url of the external link */
  url: Scalars['String'];
};

/** The format the media was released in */
export enum MediaFormat {
  /** Professionally published manga with more than one chapter */
  Manga = 'MANGA',
  /** Anime movies with a theatrical release */
  Movie = 'MOVIE',
  /** Short anime released as a music video */
  Music = 'MUSIC',
  /** Written books released as a series of light novels */
  Novel = 'NOVEL',
  /** (Original Net Animation) Anime that have been originally released online or are only available through streaming services. */
  Ona = 'ONA',
  /** Manga with just one chapter */
  OneShot = 'ONE_SHOT',
  /** (Original Video Animation) Anime that have been released directly on DVD/Blu-ray without originally going through a theatrical release or television broadcast */
  Ova = 'OVA',
  /** Special episodes that have been included in DVD/Blu-ray releases, picture dramas, pilots, etc */
  Special = 'SPECIAL',
  /** Anime broadcast on television */
  Tv = 'TV',
  /** Anime which are under 15 minutes in length and broadcast on television */
  TvShort = 'TV_SHORT'
}

/** List of anime or manga */
export type MediaList = {
  __typename?: 'MediaList';
  /** Map of advanced scores with name keys */
  advancedScores?: Maybe<Scalars['Json']>;
  /** When the entry was completed by the user */
  completedAt?: Maybe<FuzzyDate>;
  /** When the entry data was created */
  createdAt?: Maybe<Scalars['Int']>;
  /** Map of booleans for which custom lists the entry are in */
  customLists?: Maybe<Scalars['Json']>;
  /** If the entry shown be hidden from non-custom lists */
  hiddenFromStatusLists?: Maybe<Scalars['Boolean']>;
  /** The id of the list entry */
  id: Scalars['Int'];
  media?: Maybe<Media>;
  /** The id of the media */
  mediaId: Scalars['Int'];
  /** Text notes */
  notes?: Maybe<Scalars['String']>;
  /** Priority of planning */
  priority?: Maybe<Scalars['Int']>;
  /** If the entry should only be visible to authenticated user */
  private?: Maybe<Scalars['Boolean']>;
  /** The amount of episodes/chapters consumed by the user */
  progress?: Maybe<Scalars['Int']>;
  /** The amount of volumes read by the user */
  progressVolumes?: Maybe<Scalars['Int']>;
  /** The amount of times the user has rewatched/read the media */
  repeat?: Maybe<Scalars['Int']>;
  /** The score of the entry */
  score?: Maybe<Scalars['Float']>;
  /** When the entry was started by the user */
  startedAt?: Maybe<FuzzyDate>;
  /** The watching/reading status */
  status?: Maybe<MediaListStatus>;
  /** When the entry data was last updated */
  updatedAt?: Maybe<Scalars['Int']>;
  user?: Maybe<User>;
  /** The id of the user owner of the list entry */
  userId: Scalars['Int'];
};


/** List of anime or manga */
export type MediaListCustomListsArgs = {
  asArray?: Maybe<Scalars['Boolean']>;
};


/** List of anime or manga */
export type MediaListScoreArgs = {
  format?: Maybe<ScoreFormat>;
};

/** List of anime or manga */
export type MediaListCollection = {
  __typename?: 'MediaListCollection';
  /**
   * A map of media list entry arrays grouped by custom lists
   * @deprecated Not GraphQL spec compliant, use lists field instead.
   */
  customLists?: Maybe<Array<Maybe<Array<Maybe<MediaList>>>>>;
  /** If there is another chunk */
  hasNextChunk?: Maybe<Scalars['Boolean']>;
  /** Grouped media list entries */
  lists?: Maybe<Array<Maybe<MediaListGroup>>>;
  /**
   * A map of media list entry arrays grouped by status
   * @deprecated Not GraphQL spec compliant, use lists field instead.
   */
  statusLists?: Maybe<Array<Maybe<Array<Maybe<MediaList>>>>>;
  /** The owner of the list */
  user?: Maybe<User>;
};


/** List of anime or manga */
export type MediaListCollectionCustomListsArgs = {
  asArray?: Maybe<Scalars['Boolean']>;
};


/** List of anime or manga */
export type MediaListCollectionStatusListsArgs = {
  asArray?: Maybe<Scalars['Boolean']>;
};

/** List group of anime or manga entries */
export type MediaListGroup = {
  __typename?: 'MediaListGroup';
  /** Media list entries */
  entries?: Maybe<Array<Maybe<MediaList>>>;
  isCustomList?: Maybe<Scalars['Boolean']>;
  isSplitCompletedList?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  status?: Maybe<MediaListStatus>;
};

/** A user's list options */
export type MediaListOptions = {
  __typename?: 'MediaListOptions';
  /** The user's anime list options */
  animeList?: Maybe<MediaListTypeOptions>;
  /** The user's manga list options */
  mangaList?: Maybe<MediaListTypeOptions>;
  /** The default order list rows should be displayed in */
  rowOrder?: Maybe<Scalars['String']>;
  /** The score format the user is using for media lists */
  scoreFormat?: Maybe<ScoreFormat>;
  /**
   * The list theme options for both lists
   * @deprecated No longer used
   */
  sharedTheme?: Maybe<Scalars['Json']>;
  /**
   * If the shared theme should be used instead of the individual list themes
   * @deprecated No longer used
   */
  sharedThemeEnabled?: Maybe<Scalars['Boolean']>;
  /** @deprecated No longer used */
  useLegacyLists?: Maybe<Scalars['Boolean']>;
};

/** A user's list options for anime or manga lists */
export type MediaListOptionsInput = {
  /** The names of the user's advanced scoring sections */
  advancedScoring?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** If advanced scoring is enabled */
  advancedScoringEnabled?: Maybe<Scalars['Boolean']>;
  /** The names of the user's custom lists */
  customLists?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The order each list should be displayed in */
  sectionOrder?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** If the completed sections of the list should be separated by format */
  splitCompletedSectionByFormat?: Maybe<Scalars['Boolean']>;
  /** list theme */
  theme?: Maybe<Scalars['String']>;
};

/** Media list sort enums */
export enum MediaListSort {
  AddedTime = 'ADDED_TIME',
  AddedTimeDesc = 'ADDED_TIME_DESC',
  FinishedOn = 'FINISHED_ON',
  FinishedOnDesc = 'FINISHED_ON_DESC',
  MediaId = 'MEDIA_ID',
  MediaIdDesc = 'MEDIA_ID_DESC',
  MediaPopularity = 'MEDIA_POPULARITY',
  MediaPopularityDesc = 'MEDIA_POPULARITY_DESC',
  MediaTitleEnglish = 'MEDIA_TITLE_ENGLISH',
  MediaTitleEnglishDesc = 'MEDIA_TITLE_ENGLISH_DESC',
  MediaTitleNative = 'MEDIA_TITLE_NATIVE',
  MediaTitleNativeDesc = 'MEDIA_TITLE_NATIVE_DESC',
  MediaTitleRomaji = 'MEDIA_TITLE_ROMAJI',
  MediaTitleRomajiDesc = 'MEDIA_TITLE_ROMAJI_DESC',
  Priority = 'PRIORITY',
  PriorityDesc = 'PRIORITY_DESC',
  Progress = 'PROGRESS',
  ProgressDesc = 'PROGRESS_DESC',
  ProgressVolumes = 'PROGRESS_VOLUMES',
  ProgressVolumesDesc = 'PROGRESS_VOLUMES_DESC',
  Repeat = 'REPEAT',
  RepeatDesc = 'REPEAT_DESC',
  Score = 'SCORE',
  ScoreDesc = 'SCORE_DESC',
  StartedOn = 'STARTED_ON',
  StartedOnDesc = 'STARTED_ON_DESC',
  Status = 'STATUS',
  StatusDesc = 'STATUS_DESC',
  UpdatedTime = 'UPDATED_TIME',
  UpdatedTimeDesc = 'UPDATED_TIME_DESC'
}

/** Media list watching/reading status enum. */
export enum MediaListStatus {
  /** Finished watching/reading */
  Completed = 'COMPLETED',
  /** Currently watching/reading */
  Current = 'CURRENT',
  /** Stopped watching/reading before completing */
  Dropped = 'DROPPED',
  /** Paused watching/reading */
  Paused = 'PAUSED',
  /** Planning to watch/read */
  Planning = 'PLANNING',
  /** Re-watching/reading */
  Repeating = 'REPEATING'
}

/** A user's list options for anime or manga lists */
export type MediaListTypeOptions = {
  __typename?: 'MediaListTypeOptions';
  /** The names of the user's advanced scoring sections */
  advancedScoring?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** If advanced scoring is enabled */
  advancedScoringEnabled?: Maybe<Scalars['Boolean']>;
  /** The names of the user's custom lists */
  customLists?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The order each list should be displayed in */
  sectionOrder?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** If the completed sections of the list should be separated by format */
  splitCompletedSectionByFormat?: Maybe<Scalars['Boolean']>;
  /**
   * The list theme options
   * @deprecated This field has not yet been fully implemented and may change without warning
   */
  theme?: Maybe<Scalars['Json']>;
};

/** Notification for when a media entry is merged into another for a user who had it on their list */
export type MediaMergeNotification = {
  __typename?: 'MediaMergeNotification';
  /** The reason for the media data change */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The title of the deleted media */
  deletedMediaTitles?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The media that was merged into */
  media?: Maybe<Media>;
  /** The id of the media that was merged into */
  mediaId: Scalars['Int'];
  /** The reason for the media merge */
  reason?: Maybe<Scalars['String']>;
  /** The type of notification */
  type?: Maybe<NotificationType>;
};

/** The ranking of a media in a particular time span and format compared to other media */
export type MediaRank = {
  __typename?: 'MediaRank';
  /** If the ranking is based on all time instead of a season/year */
  allTime?: Maybe<Scalars['Boolean']>;
  /** String that gives context to the ranking type and time span */
  context: Scalars['String'];
  /** The format the media is ranked within */
  format: MediaFormat;
  /** The id of the rank */
  id: Scalars['Int'];
  /** The numerical rank of the media */
  rank: Scalars['Int'];
  /** The season the media is ranked within */
  season?: Maybe<MediaSeason>;
  /** The type of ranking */
  type: MediaRankType;
  /** The year the media is ranked within */
  year?: Maybe<Scalars['Int']>;
};

/** The type of ranking */
export enum MediaRankType {
  /** Ranking is based on the media's popularity */
  Popular = 'POPULAR',
  /** Ranking is based on the media's ratings/score */
  Rated = 'RATED'
}

/** Type of relation media has to its parent. */
export enum MediaRelation {
  /** An adaption of this media into a different format */
  Adaptation = 'ADAPTATION',
  /** An alternative version of the same media */
  Alternative = 'ALTERNATIVE',
  /** Shares at least 1 character */
  Character = 'CHARACTER',
  /** Version 2 only. */
  Compilation = 'COMPILATION',
  /** Version 2 only. */
  Contains = 'CONTAINS',
  /** Other */
  Other = 'OTHER',
  /** The media a side story is from */
  Parent = 'PARENT',
  /** Released before the relation */
  Prequel = 'PREQUEL',
  /** Released after the relation */
  Sequel = 'SEQUEL',
  /** A side story of the parent media */
  SideStory = 'SIDE_STORY',
  /** Version 2 only. The source material the media was adapted from */
  Source = 'SOURCE',
  /** An alternative version of the media with a different primary focus */
  SpinOff = 'SPIN_OFF',
  /** A shortened and summarized version */
  Summary = 'SUMMARY'
}

export enum MediaSeason {
  /** Months September to November */
  Fall = 'FALL',
  /** Months March to May */
  Spring = 'SPRING',
  /** Months June to August */
  Summer = 'SUMMER',
  /** Months December to February */
  Winter = 'WINTER'
}

/** Media sort enums */
export enum MediaSort {
  Chapters = 'CHAPTERS',
  ChaptersDesc = 'CHAPTERS_DESC',
  Duration = 'DURATION',
  DurationDesc = 'DURATION_DESC',
  EndDate = 'END_DATE',
  EndDateDesc = 'END_DATE_DESC',
  Episodes = 'EPISODES',
  EpisodesDesc = 'EPISODES_DESC',
  Favourites = 'FAVOURITES',
  FavouritesDesc = 'FAVOURITES_DESC',
  Format = 'FORMAT',
  FormatDesc = 'FORMAT_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Popularity = 'POPULARITY',
  PopularityDesc = 'POPULARITY_DESC',
  Score = 'SCORE',
  ScoreDesc = 'SCORE_DESC',
  SearchMatch = 'SEARCH_MATCH',
  StartDate = 'START_DATE',
  StartDateDesc = 'START_DATE_DESC',
  Status = 'STATUS',
  StatusDesc = 'STATUS_DESC',
  TitleEnglish = 'TITLE_ENGLISH',
  TitleEnglishDesc = 'TITLE_ENGLISH_DESC',
  TitleNative = 'TITLE_NATIVE',
  TitleNativeDesc = 'TITLE_NATIVE_DESC',
  TitleRomaji = 'TITLE_ROMAJI',
  TitleRomajiDesc = 'TITLE_ROMAJI_DESC',
  Trending = 'TRENDING',
  TrendingDesc = 'TRENDING_DESC',
  Type = 'TYPE',
  TypeDesc = 'TYPE_DESC',
  UpdatedAt = 'UPDATED_AT',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  Volumes = 'VOLUMES',
  VolumesDesc = 'VOLUMES_DESC'
}

/** Source type the media was adapted from */
export enum MediaSource {
  /** Version 2+ only. Japanese Anime */
  Anime = 'ANIME',
  /** Version 3 only. Comics excluding manga */
  Comic = 'COMIC',
  /** Version 2+ only. Self-published works */
  Doujinshi = 'DOUJINSHI',
  /** Version 3 only. Games excluding video games */
  Game = 'GAME',
  /** Written work published in volumes */
  LightNovel = 'LIGHT_NOVEL',
  /** Version 3 only. Live action media such as movies or TV show */
  LiveAction = 'LIVE_ACTION',
  /** Asian comic book */
  Manga = 'MANGA',
  /** Version 3 only. Multimedia project */
  MultimediaProject = 'MULTIMEDIA_PROJECT',
  /** Version 2+ only. Written works not published in volumes */
  Novel = 'NOVEL',
  /** An original production not based of another work */
  Original = 'ORIGINAL',
  /** Other */
  Other = 'OTHER',
  /** Version 3 only. Picture book */
  PictureBook = 'PICTURE_BOOK',
  /** Video game */
  VideoGame = 'VIDEO_GAME',
  /** Video game driven primary by text and narrative */
  VisualNovel = 'VISUAL_NOVEL',
  /** Version 3 only. Written works published online */
  WebNovel = 'WEB_NOVEL'
}

/** A media's statistics */
export type MediaStats = {
  __typename?: 'MediaStats';
  /** @deprecated Replaced by MediaTrends */
  airingProgression?: Maybe<Array<Maybe<AiringProgression>>>;
  scoreDistribution?: Maybe<Array<Maybe<ScoreDistribution>>>;
  statusDistribution?: Maybe<Array<Maybe<StatusDistribution>>>;
};

/** The current releasing status of the media */
export enum MediaStatus {
  /** Ended before the work could be finished */
  Cancelled = 'CANCELLED',
  /** Has completed and is no longer being released */
  Finished = 'FINISHED',
  /** Version 2 only. Is currently paused from releasing and will resume at a later date */
  Hiatus = 'HIATUS',
  /** To be released at a later date */
  NotYetReleased = 'NOT_YET_RELEASED',
  /** Currently releasing */
  Releasing = 'RELEASING'
}

/** Data and links to legal streaming episodes on external sites */
export type MediaStreamingEpisode = {
  __typename?: 'MediaStreamingEpisode';
  /** The site location of the streaming episodes */
  site?: Maybe<Scalars['String']>;
  /** Url of episode image thumbnail */
  thumbnail?: Maybe<Scalars['String']>;
  /** Title of the episode */
  title?: Maybe<Scalars['String']>;
  /** The url of the episode */
  url?: Maybe<Scalars['String']>;
};

/** Media submission */
export type MediaSubmission = {
  __typename?: 'MediaSubmission';
  /** Data Mod assigned to handle the submission */
  assignee?: Maybe<User>;
  changes?: Maybe<Array<Maybe<Scalars['String']>>>;
  characters?: Maybe<Array<Maybe<MediaSubmissionComparison>>>;
  createdAt?: Maybe<Scalars['Int']>;
  externalLinks?: Maybe<Array<Maybe<MediaExternalLink>>>;
  /** The id of the submission */
  id: Scalars['Int'];
  /** Whether the submission is locked */
  locked?: Maybe<Scalars['Boolean']>;
  media?: Maybe<Media>;
  notes?: Maybe<Scalars['String']>;
  relations?: Maybe<Array<Maybe<MediaEdge>>>;
  source?: Maybe<Scalars['String']>;
  staff?: Maybe<Array<Maybe<MediaSubmissionComparison>>>;
  /** Status of the submission */
  status?: Maybe<SubmissionStatus>;
  studios?: Maybe<Array<Maybe<MediaSubmissionComparison>>>;
  submission?: Maybe<Media>;
  /** User submitter of the submission */
  submitter?: Maybe<User>;
  submitterStats?: Maybe<Scalars['Json']>;
};

/** Media submission with comparison to current data */
export type MediaSubmissionComparison = {
  __typename?: 'MediaSubmissionComparison';
  character?: Maybe<MediaCharacter>;
  staff?: Maybe<StaffEdge>;
  studio?: Maybe<StudioEdge>;
  submission?: Maybe<MediaSubmissionEdge>;
};

export type MediaSubmissionEdge = {
  __typename?: 'MediaSubmissionEdge';
  character?: Maybe<Character>;
  characterName?: Maybe<Scalars['String']>;
  characterRole?: Maybe<CharacterRole>;
  characterSubmission?: Maybe<Character>;
  dubGroup?: Maybe<Scalars['String']>;
  /** The id of the direct submission */
  id?: Maybe<Scalars['Int']>;
  isMain?: Maybe<Scalars['Boolean']>;
  media?: Maybe<Media>;
  roleNotes?: Maybe<Scalars['String']>;
  staff?: Maybe<Staff>;
  staffRole?: Maybe<Scalars['String']>;
  staffSubmission?: Maybe<Staff>;
  studio?: Maybe<Studio>;
  voiceActor?: Maybe<Staff>;
  voiceActorSubmission?: Maybe<Staff>;
};

/** A tag that describes a theme or element of the media */
export type MediaTag = {
  __typename?: 'MediaTag';
  /** The categories of tags this tag belongs to */
  category?: Maybe<Scalars['String']>;
  /** A general description of the tag */
  description?: Maybe<Scalars['String']>;
  /** The id of the tag */
  id: Scalars['Int'];
  /** If the tag is only for adult 18+ media */
  isAdult?: Maybe<Scalars['Boolean']>;
  /** If the tag could be a spoiler for any media */
  isGeneralSpoiler?: Maybe<Scalars['Boolean']>;
  /** If the tag is a spoiler for this media */
  isMediaSpoiler?: Maybe<Scalars['Boolean']>;
  /** The name of the tag */
  name: Scalars['String'];
  /** The relevance ranking of the tag out of the 100 for this media */
  rank?: Maybe<Scalars['Int']>;
  /** The user who submitted the tag */
  userId?: Maybe<Scalars['Int']>;
};

/** The official titles of the media in various languages */
export type MediaTitle = {
  __typename?: 'MediaTitle';
  /** The official english title */
  english?: Maybe<Scalars['String']>;
  /** Official title in it's native language */
  native?: Maybe<Scalars['String']>;
  /** The romanization of the native language title */
  romaji?: Maybe<Scalars['String']>;
  /** The currently authenticated users preferred title language. Default romaji for non-authenticated */
  userPreferred?: Maybe<Scalars['String']>;
};


/** The official titles of the media in various languages */
export type MediaTitleEnglishArgs = {
  stylised?: Maybe<Scalars['Boolean']>;
};


/** The official titles of the media in various languages */
export type MediaTitleNativeArgs = {
  stylised?: Maybe<Scalars['Boolean']>;
};


/** The official titles of the media in various languages */
export type MediaTitleRomajiArgs = {
  stylised?: Maybe<Scalars['Boolean']>;
};

/** The official titles of the media in various languages */
export type MediaTitleInput = {
  /** The official english title */
  english?: Maybe<Scalars['String']>;
  /** Official title in it's native language */
  native?: Maybe<Scalars['String']>;
  /** The romanization of the native language title */
  romaji?: Maybe<Scalars['String']>;
};

/** Media trailer or advertisement */
export type MediaTrailer = {
  __typename?: 'MediaTrailer';
  /** The trailer video id */
  id?: Maybe<Scalars['String']>;
  /** The site the video is hosted by (Currently either youtube or dailymotion) */
  site?: Maybe<Scalars['String']>;
  /** The url for the thumbnail image of the video */
  thumbnail?: Maybe<Scalars['String']>;
};

/** Daily media statistics */
export type MediaTrend = {
  __typename?: 'MediaTrend';
  /** A weighted average score of all the user's scores of the media */
  averageScore?: Maybe<Scalars['Int']>;
  /** The day the data was recorded (timestamp) */
  date: Scalars['Int'];
  /** The episode number of the anime released on this day */
  episode?: Maybe<Scalars['Int']>;
  /** The number of users with watching/reading the media */
  inProgress?: Maybe<Scalars['Int']>;
  /** The related media */
  media?: Maybe<Media>;
  /** The id of the tag */
  mediaId: Scalars['Int'];
  /** The number of users with the media on their list */
  popularity?: Maybe<Scalars['Int']>;
  /** If the media was being released at this time */
  releasing: Scalars['Boolean'];
  /** The amount of media activity on the day */
  trending: Scalars['Int'];
};

export type MediaTrendConnection = {
  __typename?: 'MediaTrendConnection';
  edges?: Maybe<Array<Maybe<MediaTrendEdge>>>;
  nodes?: Maybe<Array<Maybe<MediaTrend>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Media trend connection edge */
export type MediaTrendEdge = {
  __typename?: 'MediaTrendEdge';
  node?: Maybe<MediaTrend>;
};

/** Media trend sort enums */
export enum MediaTrendSort {
  Date = 'DATE',
  DateDesc = 'DATE_DESC',
  Episode = 'EPISODE',
  EpisodeDesc = 'EPISODE_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  MediaId = 'MEDIA_ID',
  MediaIdDesc = 'MEDIA_ID_DESC',
  Popularity = 'POPULARITY',
  PopularityDesc = 'POPULARITY_DESC',
  Score = 'SCORE',
  ScoreDesc = 'SCORE_DESC',
  Trending = 'TRENDING',
  TrendingDesc = 'TRENDING_DESC'
}

/** Media type enum, anime or manga. */
export enum MediaType {
  /** Japanese Anime */
  Anime = 'ANIME',
  /** Asian comic */
  Manga = 'MANGA'
}

/** User message activity */
export type MessageActivity = {
  __typename?: 'MessageActivity';
  /** The time the activity was created at */
  createdAt: Scalars['Int'];
  /** The id of the activity */
  id: Scalars['Int'];
  /** If the currently authenticated user liked the activity */
  isLiked?: Maybe<Scalars['Boolean']>;
  /** If the activity is locked and can receive replies */
  isLocked?: Maybe<Scalars['Boolean']>;
  /** If the message is private and only viewable to the sender and recipients */
  isPrivate?: Maybe<Scalars['Boolean']>;
  /** If the currently authenticated user is subscribed to the activity */
  isSubscribed?: Maybe<Scalars['Boolean']>;
  /** The amount of likes the activity has */
  likeCount: Scalars['Int'];
  /** The users who liked the activity */
  likes?: Maybe<Array<Maybe<User>>>;
  /** The message text (Markdown) */
  message?: Maybe<Scalars['String']>;
  /** The user who sent the activity message */
  messenger?: Maybe<User>;
  /** The user id of the activity's sender */
  messengerId?: Maybe<Scalars['Int']>;
  /** The user who the activity message was sent to */
  recipient?: Maybe<User>;
  /** The user id of the activity's recipient */
  recipientId?: Maybe<Scalars['Int']>;
  /** The written replies to the activity */
  replies?: Maybe<Array<Maybe<ActivityReply>>>;
  /** The number of activity replies */
  replyCount: Scalars['Int'];
  /** The url for the activity page on the AniList website */
  siteUrl?: Maybe<Scalars['String']>;
  /** The type of the activity */
  type?: Maybe<ActivityType>;
};


/** User message activity */
export type MessageActivityMessageArgs = {
  asHtml?: Maybe<Scalars['Boolean']>;
};

export type ModAction = {
  __typename?: 'ModAction';
  createdAt: Scalars['Int'];
  data?: Maybe<Scalars['String']>;
  /** The id of the action */
  id: Scalars['Int'];
  mod?: Maybe<User>;
  objectId?: Maybe<Scalars['Int']>;
  objectType?: Maybe<Scalars['String']>;
  type?: Maybe<ModActionType>;
  user?: Maybe<User>;
};

export enum ModActionType {
  Anon = 'ANON',
  Ban = 'BAN',
  Delete = 'DELETE',
  Edit = 'EDIT',
  Expire = 'EXPIRE',
  Note = 'NOTE',
  Report = 'REPORT',
  Reset = 'RESET'
}

/** Mod role enums */
export enum ModRole {
  /** An AniList administrator */
  Admin = 'ADMIN',
  /** An anime data moderator */
  AnimeData = 'ANIME_DATA',
  /** A community moderator */
  Community = 'COMMUNITY',
  /** An AniList developer */
  Developer = 'DEVELOPER',
  /** A discord community moderator */
  DiscordCommunity = 'DISCORD_COMMUNITY',
  /** A lead anime data moderator */
  LeadAnimeData = 'LEAD_ANIME_DATA',
  /** A lead community moderator */
  LeadCommunity = 'LEAD_COMMUNITY',
  /** A head developer of AniList */
  LeadDeveloper = 'LEAD_DEVELOPER',
  /** A lead manga data moderator */
  LeadMangaData = 'LEAD_MANGA_DATA',
  /** A lead social media moderator */
  LeadSocialMedia = 'LEAD_SOCIAL_MEDIA',
  /** A manga data moderator */
  MangaData = 'MANGA_DATA',
  /** A retired moderator */
  Retired = 'RETIRED',
  /** A social media moderator */
  SocialMedia = 'SOCIAL_MEDIA'
}

export type Mutation = {
  __typename?: 'Mutation';
  /** Delete an activity item of the authenticated users */
  DeleteActivity?: Maybe<Deleted>;
  /** Delete an activity reply of the authenticated users */
  DeleteActivityReply?: Maybe<Deleted>;
  /** Delete a custom list and remove the list entries from it */
  DeleteCustomList?: Maybe<Deleted>;
  /** Delete a media list entry */
  DeleteMediaListEntry?: Maybe<Deleted>;
  /** Delete a review */
  DeleteReview?: Maybe<Deleted>;
  /** Delete a thread */
  DeleteThread?: Maybe<Deleted>;
  /** Delete a thread comment */
  DeleteThreadComment?: Maybe<Deleted>;
  /** Rate a review */
  RateReview?: Maybe<Review>;
  /** Create or update an activity reply */
  SaveActivityReply?: Maybe<ActivityReply>;
  /** Update list activity (Mod Only) */
  SaveListActivity?: Maybe<ListActivity>;
  /** Create or update a media list entry */
  SaveMediaListEntry?: Maybe<MediaList>;
  /** Create or update message activity for the currently authenticated user */
  SaveMessageActivity?: Maybe<MessageActivity>;
  /** Recommendation a media */
  SaveRecommendation?: Maybe<Recommendation>;
  /** Create or update a review */
  SaveReview?: Maybe<Review>;
  /** Create or update text activity for the currently authenticated user */
  SaveTextActivity?: Maybe<TextActivity>;
  /** Create or update a forum thread */
  SaveThread?: Maybe<Thread>;
  /** Create or update a thread comment */
  SaveThreadComment?: Maybe<ThreadComment>;
  /** Toggle the subscription of an activity item */
  ToggleActivitySubscription?: Maybe<ActivityUnion>;
  /** Favourite or unfavourite an anime, manga, character, staff member, or studio */
  ToggleFavourite?: Maybe<Favourites>;
  /** Toggle the un/following of a user */
  ToggleFollow?: Maybe<User>;
  /**
   * Add or remove a like from a likeable type.
   *                           Returns all the users who liked the same model
   */
  ToggleLike?: Maybe<Array<Maybe<User>>>;
  /** Add or remove a like from a likeable type. */
  ToggleLikeV2?: Maybe<LikeableUnion>;
  /** Toggle the subscription of a forum thread */
  ToggleThreadSubscription?: Maybe<Thread>;
  UpdateAniChartHighlights?: Maybe<Scalars['Json']>;
  UpdateAniChartSettings?: Maybe<Scalars['Json']>;
  /** Update the order favourites are displayed in */
  UpdateFavouriteOrder?: Maybe<Favourites>;
  /** Update multiple media list entries to the same values */
  UpdateMediaListEntries?: Maybe<Array<Maybe<MediaList>>>;
  UpdateUser?: Maybe<User>;
};


export type MutationDeleteActivityArgs = {
  id?: Maybe<Scalars['Int']>;
};


export type MutationDeleteActivityReplyArgs = {
  id?: Maybe<Scalars['Int']>;
};


export type MutationDeleteCustomListArgs = {
  customList?: Maybe<Scalars['String']>;
  type?: Maybe<MediaType>;
};


export type MutationDeleteMediaListEntryArgs = {
  id?: Maybe<Scalars['Int']>;
};


export type MutationDeleteReviewArgs = {
  id?: Maybe<Scalars['Int']>;
};


export type MutationDeleteThreadArgs = {
  id?: Maybe<Scalars['Int']>;
};


export type MutationDeleteThreadCommentArgs = {
  id?: Maybe<Scalars['Int']>;
};


export type MutationRateReviewArgs = {
  rating?: Maybe<ReviewRating>;
  reviewId?: Maybe<Scalars['Int']>;
};


export type MutationSaveActivityReplyArgs = {
  activityId?: Maybe<Scalars['Int']>;
  asMod?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  text?: Maybe<Scalars['String']>;
};


export type MutationSaveListActivityArgs = {
  id?: Maybe<Scalars['Int']>;
  locked?: Maybe<Scalars['Boolean']>;
};


export type MutationSaveMediaListEntryArgs = {
  advancedScores?: Maybe<Array<Maybe<Scalars['Float']>>>;
  completedAt?: Maybe<FuzzyDateInput>;
  customLists?: Maybe<Array<Maybe<Scalars['String']>>>;
  hiddenFromStatusLists?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  notes?: Maybe<Scalars['String']>;
  priority?: Maybe<Scalars['Int']>;
  private?: Maybe<Scalars['Boolean']>;
  progress?: Maybe<Scalars['Int']>;
  progressVolumes?: Maybe<Scalars['Int']>;
  repeat?: Maybe<Scalars['Int']>;
  score?: Maybe<Scalars['Float']>;
  scoreRaw?: Maybe<Scalars['Int']>;
  startedAt?: Maybe<FuzzyDateInput>;
  status?: Maybe<MediaListStatus>;
};


export type MutationSaveMessageActivityArgs = {
  asMod?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  locked?: Maybe<Scalars['Boolean']>;
  message?: Maybe<Scalars['String']>;
  private?: Maybe<Scalars['Boolean']>;
  recipientId?: Maybe<Scalars['Int']>;
};


export type MutationSaveRecommendationArgs = {
  mediaId?: Maybe<Scalars['Int']>;
  mediaRecommendationId?: Maybe<Scalars['Int']>;
  rating?: Maybe<RecommendationRating>;
};


export type MutationSaveReviewArgs = {
  body?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  private?: Maybe<Scalars['Boolean']>;
  score?: Maybe<Scalars['Int']>;
  summary?: Maybe<Scalars['String']>;
};


export type MutationSaveTextActivityArgs = {
  id?: Maybe<Scalars['Int']>;
  locked?: Maybe<Scalars['Boolean']>;
  text?: Maybe<Scalars['String']>;
};


export type MutationSaveThreadArgs = {
  body?: Maybe<Scalars['String']>;
  categories?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id?: Maybe<Scalars['Int']>;
  locked?: Maybe<Scalars['Boolean']>;
  mediaCategories?: Maybe<Array<Maybe<Scalars['Int']>>>;
  sticky?: Maybe<Scalars['Boolean']>;
  title?: Maybe<Scalars['String']>;
};


export type MutationSaveThreadCommentArgs = {
  comment?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  locked?: Maybe<Scalars['Boolean']>;
  parentCommentId?: Maybe<Scalars['Int']>;
  threadId?: Maybe<Scalars['Int']>;
};


export type MutationToggleActivitySubscriptionArgs = {
  activityId?: Maybe<Scalars['Int']>;
  subscribe?: Maybe<Scalars['Boolean']>;
};


export type MutationToggleFavouriteArgs = {
  animeId?: Maybe<Scalars['Int']>;
  characterId?: Maybe<Scalars['Int']>;
  mangaId?: Maybe<Scalars['Int']>;
  staffId?: Maybe<Scalars['Int']>;
  studioId?: Maybe<Scalars['Int']>;
};


export type MutationToggleFollowArgs = {
  userId?: Maybe<Scalars['Int']>;
};


export type MutationToggleLikeArgs = {
  id?: Maybe<Scalars['Int']>;
  type?: Maybe<LikeableType>;
};


export type MutationToggleLikeV2Args = {
  id?: Maybe<Scalars['Int']>;
  type?: Maybe<LikeableType>;
};


export type MutationToggleThreadSubscriptionArgs = {
  subscribe?: Maybe<Scalars['Boolean']>;
  threadId?: Maybe<Scalars['Int']>;
};


export type MutationUpdateAniChartHighlightsArgs = {
  highlights?: Maybe<Array<Maybe<AniChartHighlightInput>>>;
};


export type MutationUpdateAniChartSettingsArgs = {
  outgoingLinkProvider?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  theme?: Maybe<Scalars['String']>;
  titleLanguage?: Maybe<Scalars['String']>;
};


export type MutationUpdateFavouriteOrderArgs = {
  animeIds?: Maybe<Array<Maybe<Scalars['Int']>>>;
  animeOrder?: Maybe<Array<Maybe<Scalars['Int']>>>;
  characterIds?: Maybe<Array<Maybe<Scalars['Int']>>>;
  characterOrder?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mangaIds?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mangaOrder?: Maybe<Array<Maybe<Scalars['Int']>>>;
  staffIds?: Maybe<Array<Maybe<Scalars['Int']>>>;
  staffOrder?: Maybe<Array<Maybe<Scalars['Int']>>>;
  studioIds?: Maybe<Array<Maybe<Scalars['Int']>>>;
  studioOrder?: Maybe<Array<Maybe<Scalars['Int']>>>;
};


export type MutationUpdateMediaListEntriesArgs = {
  advancedScores?: Maybe<Array<Maybe<Scalars['Float']>>>;
  completedAt?: Maybe<FuzzyDateInput>;
  hiddenFromStatusLists?: Maybe<Scalars['Boolean']>;
  ids?: Maybe<Array<Maybe<Scalars['Int']>>>;
  notes?: Maybe<Scalars['String']>;
  priority?: Maybe<Scalars['Int']>;
  private?: Maybe<Scalars['Boolean']>;
  progress?: Maybe<Scalars['Int']>;
  progressVolumes?: Maybe<Scalars['Int']>;
  repeat?: Maybe<Scalars['Int']>;
  score?: Maybe<Scalars['Float']>;
  scoreRaw?: Maybe<Scalars['Int']>;
  startedAt?: Maybe<FuzzyDateInput>;
  status?: Maybe<MediaListStatus>;
};


export type MutationUpdateUserArgs = {
  about?: Maybe<Scalars['String']>;
  activityMergeTime?: Maybe<Scalars['Int']>;
  airingNotifications?: Maybe<Scalars['Boolean']>;
  animeListOptions?: Maybe<MediaListOptionsInput>;
  displayAdultContent?: Maybe<Scalars['Boolean']>;
  donatorBadge?: Maybe<Scalars['String']>;
  mangaListOptions?: Maybe<MediaListOptionsInput>;
  notificationOptions?: Maybe<Array<Maybe<NotificationOptionInput>>>;
  profileColor?: Maybe<Scalars['String']>;
  rowOrder?: Maybe<Scalars['String']>;
  scoreFormat?: Maybe<ScoreFormat>;
  staffNameLanguage?: Maybe<UserStaffNameLanguage>;
  timezone?: Maybe<Scalars['String']>;
  titleLanguage?: Maybe<UserTitleLanguage>;
};

/** Notification option */
export type NotificationOption = {
  __typename?: 'NotificationOption';
  /** Whether this type of notification is enabled */
  enabled?: Maybe<Scalars['Boolean']>;
  /** The type of notification */
  type?: Maybe<NotificationType>;
};

/** Notification option input */
export type NotificationOptionInput = {
  /** Whether this type of notification is enabled */
  enabled?: Maybe<Scalars['Boolean']>;
  /** The type of notification */
  type?: Maybe<NotificationType>;
};

/** Notification type enum */
export enum NotificationType {
  /** A user has liked your activity */
  ActivityLike = 'ACTIVITY_LIKE',
  /** A user has mentioned you in their activity */
  ActivityMention = 'ACTIVITY_MENTION',
  /** A user has sent you message */
  ActivityMessage = 'ACTIVITY_MESSAGE',
  /** A user has replied to your activity */
  ActivityReply = 'ACTIVITY_REPLY',
  /** A user has liked your activity reply */
  ActivityReplyLike = 'ACTIVITY_REPLY_LIKE',
  /** A user has replied to activity you have also replied to */
  ActivityReplySubscribed = 'ACTIVITY_REPLY_SUBSCRIBED',
  /** An anime you are currently watching has aired */
  Airing = 'AIRING',
  /** A user has followed you */
  Following = 'FOLLOWING',
  /** An anime or manga has had a data change that affects how a user may track it in their lists */
  MediaDataChange = 'MEDIA_DATA_CHANGE',
  /** An anime or manga on the user's list has been deleted from the site */
  MediaDeletion = 'MEDIA_DELETION',
  /** Anime or manga entries on the user's list have been merged into a single entry */
  MediaMerge = 'MEDIA_MERGE',
  /** A new anime or manga has been added to the site where its related media is on the user's list */
  RelatedMediaAddition = 'RELATED_MEDIA_ADDITION',
  /** A user has liked your forum comment */
  ThreadCommentLike = 'THREAD_COMMENT_LIKE',
  /** A user has mentioned you in a forum comment */
  ThreadCommentMention = 'THREAD_COMMENT_MENTION',
  /** A user has replied to your forum comment */
  ThreadCommentReply = 'THREAD_COMMENT_REPLY',
  /** A user has liked your forum thread */
  ThreadLike = 'THREAD_LIKE',
  /** A user has commented in one of your subscribed forum threads */
  ThreadSubscribed = 'THREAD_SUBSCRIBED'
}

/** Notification union type */
export type NotificationUnion = ActivityLikeNotification | ActivityMentionNotification | ActivityMessageNotification | ActivityReplyLikeNotification | ActivityReplyNotification | ActivityReplySubscribedNotification | AiringNotification | FollowingNotification | MediaDataChangeNotification | MediaDeletionNotification | MediaMergeNotification | RelatedMediaAdditionNotification | ThreadCommentLikeNotification | ThreadCommentMentionNotification | ThreadCommentReplyNotification | ThreadCommentSubscribedNotification | ThreadLikeNotification;

/** Page of data */
export type Page = {
  __typename?: 'Page';
  activities?: Maybe<Array<Maybe<ActivityUnion>>>;
  activityReplies?: Maybe<Array<Maybe<ActivityReply>>>;
  airingSchedules?: Maybe<Array<Maybe<AiringSchedule>>>;
  characters?: Maybe<Array<Maybe<Character>>>;
  followers?: Maybe<Array<Maybe<User>>>;
  following?: Maybe<Array<Maybe<User>>>;
  likes?: Maybe<Array<Maybe<User>>>;
  media?: Maybe<Array<Maybe<Media>>>;
  mediaList?: Maybe<Array<Maybe<MediaList>>>;
  mediaTrends?: Maybe<Array<Maybe<MediaTrend>>>;
  notifications?: Maybe<Array<Maybe<NotificationUnion>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
  recommendations?: Maybe<Array<Maybe<Recommendation>>>;
  reviews?: Maybe<Array<Maybe<Review>>>;
  staff?: Maybe<Array<Maybe<Staff>>>;
  studios?: Maybe<Array<Maybe<Studio>>>;
  threadComments?: Maybe<Array<Maybe<ThreadComment>>>;
  threads?: Maybe<Array<Maybe<Thread>>>;
  users?: Maybe<Array<Maybe<User>>>;
};


/** Page of data */
export type PageActivitiesArgs = {
  createdAt?: Maybe<Scalars['Int']>;
  createdAt_greater?: Maybe<Scalars['Int']>;
  createdAt_lesser?: Maybe<Scalars['Int']>;
  hasReplies?: Maybe<Scalars['Boolean']>;
  hasRepliesOrTypeText?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isFollowing?: Maybe<Scalars['Boolean']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not?: Maybe<Scalars['Int']>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  messengerId?: Maybe<Scalars['Int']>;
  messengerId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  messengerId_not?: Maybe<Scalars['Int']>;
  messengerId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  sort?: Maybe<Array<Maybe<ActivitySort>>>;
  type?: Maybe<ActivityType>;
  type_in?: Maybe<Array<Maybe<ActivityType>>>;
  type_not?: Maybe<ActivityType>;
  type_not_in?: Maybe<Array<Maybe<ActivityType>>>;
  userId?: Maybe<Scalars['Int']>;
  userId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  userId_not?: Maybe<Scalars['Int']>;
  userId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
};


/** Page of data */
export type PageActivityRepliesArgs = {
  activityId?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['Int']>;
};


/** Page of data */
export type PageAiringSchedulesArgs = {
  airingAt?: Maybe<Scalars['Int']>;
  airingAt_greater?: Maybe<Scalars['Int']>;
  airingAt_lesser?: Maybe<Scalars['Int']>;
  episode?: Maybe<Scalars['Int']>;
  episode_greater?: Maybe<Scalars['Int']>;
  episode_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  episode_lesser?: Maybe<Scalars['Int']>;
  episode_not?: Maybe<Scalars['Int']>;
  episode_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not?: Maybe<Scalars['Int']>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  notYetAired?: Maybe<Scalars['Boolean']>;
  sort?: Maybe<Array<Maybe<AiringSort>>>;
};


/** Page of data */
export type PageCharactersArgs = {
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isBirthday?: Maybe<Scalars['Boolean']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<CharacterSort>>>;
};


/** Page of data */
export type PageFollowersArgs = {
  sort?: Maybe<Array<Maybe<UserSort>>>;
  userId: Scalars['Int'];
};


/** Page of data */
export type PageFollowingArgs = {
  sort?: Maybe<Array<Maybe<UserSort>>>;
  userId: Scalars['Int'];
};


/** Page of data */
export type PageLikesArgs = {
  likeableId?: Maybe<Scalars['Int']>;
  type?: Maybe<LikeableType>;
};


/** Page of data */
export type PageMediaArgs = {
  averageScore?: Maybe<Scalars['Int']>;
  averageScore_greater?: Maybe<Scalars['Int']>;
  averageScore_lesser?: Maybe<Scalars['Int']>;
  averageScore_not?: Maybe<Scalars['Int']>;
  chapters?: Maybe<Scalars['Int']>;
  chapters_greater?: Maybe<Scalars['Int']>;
  chapters_lesser?: Maybe<Scalars['Int']>;
  countryOfOrigin?: Maybe<Scalars['CountryCode']>;
  duration?: Maybe<Scalars['Int']>;
  duration_greater?: Maybe<Scalars['Int']>;
  duration_lesser?: Maybe<Scalars['Int']>;
  endDate?: Maybe<Scalars['FuzzyDateInt']>;
  endDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
  endDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  endDate_like?: Maybe<Scalars['String']>;
  episodes?: Maybe<Scalars['Int']>;
  episodes_greater?: Maybe<Scalars['Int']>;
  episodes_lesser?: Maybe<Scalars['Int']>;
  format?: Maybe<MediaFormat>;
  format_in?: Maybe<Array<Maybe<MediaFormat>>>;
  format_not?: Maybe<MediaFormat>;
  format_not_in?: Maybe<Array<Maybe<MediaFormat>>>;
  genre?: Maybe<Scalars['String']>;
  genre_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  genre_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  idMal?: Maybe<Scalars['Int']>;
  idMal_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  idMal_not?: Maybe<Scalars['Int']>;
  idMal_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isAdult?: Maybe<Scalars['Boolean']>;
  isLicensed?: Maybe<Scalars['Boolean']>;
  licensedBy?: Maybe<Scalars['String']>;
  licensedBy_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  minimumTagRank?: Maybe<Scalars['Int']>;
  onList?: Maybe<Scalars['Boolean']>;
  popularity?: Maybe<Scalars['Int']>;
  popularity_greater?: Maybe<Scalars['Int']>;
  popularity_lesser?: Maybe<Scalars['Int']>;
  popularity_not?: Maybe<Scalars['Int']>;
  search?: Maybe<Scalars['String']>;
  season?: Maybe<MediaSeason>;
  seasonYear?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<MediaSort>>>;
  source?: Maybe<MediaSource>;
  source_in?: Maybe<Array<Maybe<MediaSource>>>;
  startDate?: Maybe<Scalars['FuzzyDateInt']>;
  startDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
  startDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  startDate_like?: Maybe<Scalars['String']>;
  status?: Maybe<MediaStatus>;
  status_in?: Maybe<Array<Maybe<MediaStatus>>>;
  status_not?: Maybe<MediaStatus>;
  status_not_in?: Maybe<Array<Maybe<MediaStatus>>>;
  tag?: Maybe<Scalars['String']>;
  tag_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tag_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tagCategory?: Maybe<Scalars['String']>;
  tagCategory_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tagCategory_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  type?: Maybe<MediaType>;
  volumes?: Maybe<Scalars['Int']>;
  volumes_greater?: Maybe<Scalars['Int']>;
  volumes_lesser?: Maybe<Scalars['Int']>;
};


/** Page of data */
export type PageMediaListArgs = {
  compareWithAuthList?: Maybe<Scalars['Boolean']>;
  completedAt?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_like?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  isFollowing?: Maybe<Scalars['Boolean']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  notes?: Maybe<Scalars['String']>;
  notes_like?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<MediaListSort>>>;
  startedAt?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_like?: Maybe<Scalars['String']>;
  status?: Maybe<MediaListStatus>;
  status_in?: Maybe<Array<Maybe<MediaListStatus>>>;
  status_not?: Maybe<MediaListStatus>;
  status_not_in?: Maybe<Array<Maybe<MediaListStatus>>>;
  type?: Maybe<MediaType>;
  userId?: Maybe<Scalars['Int']>;
  userId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  userName?: Maybe<Scalars['String']>;
};


/** Page of data */
export type PageMediaTrendsArgs = {
  averageScore?: Maybe<Scalars['Int']>;
  averageScore_greater?: Maybe<Scalars['Int']>;
  averageScore_lesser?: Maybe<Scalars['Int']>;
  averageScore_not?: Maybe<Scalars['Int']>;
  date?: Maybe<Scalars['Int']>;
  date_greater?: Maybe<Scalars['Int']>;
  date_lesser?: Maybe<Scalars['Int']>;
  episode?: Maybe<Scalars['Int']>;
  episode_greater?: Maybe<Scalars['Int']>;
  episode_lesser?: Maybe<Scalars['Int']>;
  episode_not?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not?: Maybe<Scalars['Int']>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  popularity?: Maybe<Scalars['Int']>;
  popularity_greater?: Maybe<Scalars['Int']>;
  popularity_lesser?: Maybe<Scalars['Int']>;
  popularity_not?: Maybe<Scalars['Int']>;
  releasing?: Maybe<Scalars['Boolean']>;
  sort?: Maybe<Array<Maybe<MediaTrendSort>>>;
  trending?: Maybe<Scalars['Int']>;
  trending_greater?: Maybe<Scalars['Int']>;
  trending_lesser?: Maybe<Scalars['Int']>;
  trending_not?: Maybe<Scalars['Int']>;
};


/** Page of data */
export type PageNotificationsArgs = {
  resetNotificationCount?: Maybe<Scalars['Boolean']>;
  type?: Maybe<NotificationType>;
  type_in?: Maybe<Array<Maybe<NotificationType>>>;
};


/** Page of data */
export type PageRecommendationsArgs = {
  id?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaRecommendationId?: Maybe<Scalars['Int']>;
  onList?: Maybe<Scalars['Boolean']>;
  rating?: Maybe<Scalars['Int']>;
  rating_greater?: Maybe<Scalars['Int']>;
  rating_lesser?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<RecommendationSort>>>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data */
export type PageReviewsArgs = {
  id?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaType?: Maybe<MediaType>;
  sort?: Maybe<Array<Maybe<ReviewSort>>>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data */
export type PageStaffArgs = {
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isBirthday?: Maybe<Scalars['Boolean']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<StaffSort>>>;
};


/** Page of data */
export type PageStudiosArgs = {
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<StudioSort>>>;
};


/** Page of data */
export type PageThreadCommentsArgs = {
  id?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<ThreadCommentSort>>>;
  threadId?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data */
export type PageThreadsArgs = {
  categoryId?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaCategoryId?: Maybe<Scalars['Int']>;
  replyUserId?: Maybe<Scalars['Int']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<ThreadSort>>>;
  subscribed?: Maybe<Scalars['Boolean']>;
  userId?: Maybe<Scalars['Int']>;
};


/** Page of data */
export type PageUsersArgs = {
  id?: Maybe<Scalars['Int']>;
  isModerator?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<UserSort>>>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  /** The current page */
  currentPage?: Maybe<Scalars['Int']>;
  /** If there is another page */
  hasNextPage?: Maybe<Scalars['Boolean']>;
  /** The last page */
  lastPage?: Maybe<Scalars['Int']>;
  /** The count on a page */
  perPage?: Maybe<Scalars['Int']>;
  /** The total number of items */
  total?: Maybe<Scalars['Int']>;
};

/** Provides the parsed markdown as html */
export type ParsedMarkdown = {
  __typename?: 'ParsedMarkdown';
  /** The parsed markdown as html */
  html?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  /** Activity query */
  Activity?: Maybe<ActivityUnion>;
  /** Activity reply query */
  ActivityReply?: Maybe<ActivityReply>;
  /** Airing schedule query */
  AiringSchedule?: Maybe<AiringSchedule>;
  AniChartUser?: Maybe<AniChartUser>;
  /** Character query */
  Character?: Maybe<Character>;
  /** Follow query */
  Follower?: Maybe<User>;
  /** Follow query */
  Following?: Maybe<User>;
  /** Collection of all the possible media genres */
  GenreCollection?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Like query */
  Like?: Maybe<User>;
  /** Provide AniList markdown to be converted to html (Requires auth) */
  Markdown?: Maybe<ParsedMarkdown>;
  /** Media query */
  Media?: Maybe<Media>;
  /** Media list query */
  MediaList?: Maybe<MediaList>;
  /** Media list collection query, provides list pre-grouped by status & custom lists. User ID and Media Type arguments required. */
  MediaListCollection?: Maybe<MediaListCollection>;
  /** Collection of all the possible media tags */
  MediaTagCollection?: Maybe<Array<Maybe<MediaTag>>>;
  /** Media Trend query */
  MediaTrend?: Maybe<MediaTrend>;
  /** Notification query */
  Notification?: Maybe<NotificationUnion>;
  Page?: Maybe<Page>;
  /** Recommendation query */
  Recommendation?: Maybe<Recommendation>;
  /** Review query */
  Review?: Maybe<Review>;
  /** Site statistics query */
  SiteStatistics?: Maybe<SiteStatistics>;
  /** Staff query */
  Staff?: Maybe<Staff>;
  /** Studio query */
  Studio?: Maybe<Studio>;
  /** Thread query */
  Thread?: Maybe<Thread>;
  /** Comment query */
  ThreadComment?: Maybe<Array<Maybe<ThreadComment>>>;
  /** User query */
  User?: Maybe<User>;
  /** Get the currently authenticated user */
  Viewer?: Maybe<User>;
};


export type QueryActivityArgs = {
  createdAt?: Maybe<Scalars['Int']>;
  createdAt_greater?: Maybe<Scalars['Int']>;
  createdAt_lesser?: Maybe<Scalars['Int']>;
  hasReplies?: Maybe<Scalars['Boolean']>;
  hasRepliesOrTypeText?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isFollowing?: Maybe<Scalars['Boolean']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not?: Maybe<Scalars['Int']>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  messengerId?: Maybe<Scalars['Int']>;
  messengerId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  messengerId_not?: Maybe<Scalars['Int']>;
  messengerId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  sort?: Maybe<Array<Maybe<ActivitySort>>>;
  type?: Maybe<ActivityType>;
  type_in?: Maybe<Array<Maybe<ActivityType>>>;
  type_not?: Maybe<ActivityType>;
  type_not_in?: Maybe<Array<Maybe<ActivityType>>>;
  userId?: Maybe<Scalars['Int']>;
  userId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  userId_not?: Maybe<Scalars['Int']>;
  userId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
};


export type QueryActivityReplyArgs = {
  activityId?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['Int']>;
};


export type QueryAiringScheduleArgs = {
  airingAt?: Maybe<Scalars['Int']>;
  airingAt_greater?: Maybe<Scalars['Int']>;
  airingAt_lesser?: Maybe<Scalars['Int']>;
  episode?: Maybe<Scalars['Int']>;
  episode_greater?: Maybe<Scalars['Int']>;
  episode_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  episode_lesser?: Maybe<Scalars['Int']>;
  episode_not?: Maybe<Scalars['Int']>;
  episode_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not?: Maybe<Scalars['Int']>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  notYetAired?: Maybe<Scalars['Boolean']>;
  sort?: Maybe<Array<Maybe<AiringSort>>>;
};


export type QueryCharacterArgs = {
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isBirthday?: Maybe<Scalars['Boolean']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<CharacterSort>>>;
};


export type QueryFollowerArgs = {
  sort?: Maybe<Array<Maybe<UserSort>>>;
  userId: Scalars['Int'];
};


export type QueryFollowingArgs = {
  sort?: Maybe<Array<Maybe<UserSort>>>;
  userId: Scalars['Int'];
};


export type QueryLikeArgs = {
  likeableId?: Maybe<Scalars['Int']>;
  type?: Maybe<LikeableType>;
};


export type QueryMarkdownArgs = {
  markdown: Scalars['String'];
};


export type QueryMediaArgs = {
  averageScore?: Maybe<Scalars['Int']>;
  averageScore_greater?: Maybe<Scalars['Int']>;
  averageScore_lesser?: Maybe<Scalars['Int']>;
  averageScore_not?: Maybe<Scalars['Int']>;
  chapters?: Maybe<Scalars['Int']>;
  chapters_greater?: Maybe<Scalars['Int']>;
  chapters_lesser?: Maybe<Scalars['Int']>;
  countryOfOrigin?: Maybe<Scalars['CountryCode']>;
  duration?: Maybe<Scalars['Int']>;
  duration_greater?: Maybe<Scalars['Int']>;
  duration_lesser?: Maybe<Scalars['Int']>;
  endDate?: Maybe<Scalars['FuzzyDateInt']>;
  endDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
  endDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  endDate_like?: Maybe<Scalars['String']>;
  episodes?: Maybe<Scalars['Int']>;
  episodes_greater?: Maybe<Scalars['Int']>;
  episodes_lesser?: Maybe<Scalars['Int']>;
  format?: Maybe<MediaFormat>;
  format_in?: Maybe<Array<Maybe<MediaFormat>>>;
  format_not?: Maybe<MediaFormat>;
  format_not_in?: Maybe<Array<Maybe<MediaFormat>>>;
  genre?: Maybe<Scalars['String']>;
  genre_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  genre_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  idMal?: Maybe<Scalars['Int']>;
  idMal_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  idMal_not?: Maybe<Scalars['Int']>;
  idMal_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isAdult?: Maybe<Scalars['Boolean']>;
  isLicensed?: Maybe<Scalars['Boolean']>;
  licensedBy?: Maybe<Scalars['String']>;
  licensedBy_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  minimumTagRank?: Maybe<Scalars['Int']>;
  onList?: Maybe<Scalars['Boolean']>;
  popularity?: Maybe<Scalars['Int']>;
  popularity_greater?: Maybe<Scalars['Int']>;
  popularity_lesser?: Maybe<Scalars['Int']>;
  popularity_not?: Maybe<Scalars['Int']>;
  search?: Maybe<Scalars['String']>;
  season?: Maybe<MediaSeason>;
  seasonYear?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<MediaSort>>>;
  source?: Maybe<MediaSource>;
  source_in?: Maybe<Array<Maybe<MediaSource>>>;
  startDate?: Maybe<Scalars['FuzzyDateInt']>;
  startDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
  startDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  startDate_like?: Maybe<Scalars['String']>;
  status?: Maybe<MediaStatus>;
  status_in?: Maybe<Array<Maybe<MediaStatus>>>;
  status_not?: Maybe<MediaStatus>;
  status_not_in?: Maybe<Array<Maybe<MediaStatus>>>;
  tag?: Maybe<Scalars['String']>;
  tag_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tag_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tagCategory?: Maybe<Scalars['String']>;
  tagCategory_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tagCategory_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  type?: Maybe<MediaType>;
  volumes?: Maybe<Scalars['Int']>;
  volumes_greater?: Maybe<Scalars['Int']>;
  volumes_lesser?: Maybe<Scalars['Int']>;
};


export type QueryMediaListArgs = {
  compareWithAuthList?: Maybe<Scalars['Boolean']>;
  completedAt?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_like?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  isFollowing?: Maybe<Scalars['Boolean']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  notes?: Maybe<Scalars['String']>;
  notes_like?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<MediaListSort>>>;
  startedAt?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_like?: Maybe<Scalars['String']>;
  status?: Maybe<MediaListStatus>;
  status_in?: Maybe<Array<Maybe<MediaListStatus>>>;
  status_not?: Maybe<MediaListStatus>;
  status_not_in?: Maybe<Array<Maybe<MediaListStatus>>>;
  type?: Maybe<MediaType>;
  userId?: Maybe<Scalars['Int']>;
  userId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  userName?: Maybe<Scalars['String']>;
};


export type QueryMediaListCollectionArgs = {
  chunk?: Maybe<Scalars['Int']>;
  completedAt?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  completedAt_like?: Maybe<Scalars['String']>;
  forceSingleCompletedList?: Maybe<Scalars['Boolean']>;
  notes?: Maybe<Scalars['String']>;
  notes_like?: Maybe<Scalars['String']>;
  perChunk?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<MediaListSort>>>;
  startedAt?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
  startedAt_like?: Maybe<Scalars['String']>;
  status?: Maybe<MediaListStatus>;
  status_in?: Maybe<Array<Maybe<MediaListStatus>>>;
  status_not?: Maybe<MediaListStatus>;
  status_not_in?: Maybe<Array<Maybe<MediaListStatus>>>;
  type?: Maybe<MediaType>;
  userId?: Maybe<Scalars['Int']>;
  userName?: Maybe<Scalars['String']>;
};


export type QueryMediaTagCollectionArgs = {
  status?: Maybe<Scalars['Int']>;
};


export type QueryMediaTrendArgs = {
  averageScore?: Maybe<Scalars['Int']>;
  averageScore_greater?: Maybe<Scalars['Int']>;
  averageScore_lesser?: Maybe<Scalars['Int']>;
  averageScore_not?: Maybe<Scalars['Int']>;
  date?: Maybe<Scalars['Int']>;
  date_greater?: Maybe<Scalars['Int']>;
  date_lesser?: Maybe<Scalars['Int']>;
  episode?: Maybe<Scalars['Int']>;
  episode_greater?: Maybe<Scalars['Int']>;
  episode_lesser?: Maybe<Scalars['Int']>;
  episode_not?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaId_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaId_not?: Maybe<Scalars['Int']>;
  mediaId_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  popularity?: Maybe<Scalars['Int']>;
  popularity_greater?: Maybe<Scalars['Int']>;
  popularity_lesser?: Maybe<Scalars['Int']>;
  popularity_not?: Maybe<Scalars['Int']>;
  releasing?: Maybe<Scalars['Boolean']>;
  sort?: Maybe<Array<Maybe<MediaTrendSort>>>;
  trending?: Maybe<Scalars['Int']>;
  trending_greater?: Maybe<Scalars['Int']>;
  trending_lesser?: Maybe<Scalars['Int']>;
  trending_not?: Maybe<Scalars['Int']>;
};


export type QueryNotificationArgs = {
  resetNotificationCount?: Maybe<Scalars['Boolean']>;
  type?: Maybe<NotificationType>;
  type_in?: Maybe<Array<Maybe<NotificationType>>>;
};


export type QueryPageArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
};


export type QueryRecommendationArgs = {
  id?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaRecommendationId?: Maybe<Scalars['Int']>;
  onList?: Maybe<Scalars['Boolean']>;
  rating?: Maybe<Scalars['Int']>;
  rating_greater?: Maybe<Scalars['Int']>;
  rating_lesser?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<RecommendationSort>>>;
  userId?: Maybe<Scalars['Int']>;
};


export type QueryReviewArgs = {
  id?: Maybe<Scalars['Int']>;
  mediaId?: Maybe<Scalars['Int']>;
  mediaType?: Maybe<MediaType>;
  sort?: Maybe<Array<Maybe<ReviewSort>>>;
  userId?: Maybe<Scalars['Int']>;
};


export type QueryStaffArgs = {
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isBirthday?: Maybe<Scalars['Boolean']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<StaffSort>>>;
};


export type QueryStudioArgs = {
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<StudioSort>>>;
};


export type QueryThreadArgs = {
  categoryId?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  mediaCategoryId?: Maybe<Scalars['Int']>;
  replyUserId?: Maybe<Scalars['Int']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<ThreadSort>>>;
  subscribed?: Maybe<Scalars['Boolean']>;
  userId?: Maybe<Scalars['Int']>;
};


export type QueryThreadCommentArgs = {
  id?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<ThreadCommentSort>>>;
  threadId?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};


export type QueryUserArgs = {
  id?: Maybe<Scalars['Int']>;
  isModerator?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  sort?: Maybe<Array<Maybe<UserSort>>>;
};

/** Media recommendation */
export type Recommendation = {
  __typename?: 'Recommendation';
  /** The id of the recommendation */
  id: Scalars['Int'];
  /** The media the recommendation is from */
  media?: Maybe<Media>;
  /** The recommended media */
  mediaRecommendation?: Maybe<Media>;
  /** Users rating of the recommendation */
  rating?: Maybe<Scalars['Int']>;
  /** The user that first created the recommendation */
  user?: Maybe<User>;
  /** The rating of the recommendation by currently authenticated user */
  userRating?: Maybe<RecommendationRating>;
};

export type RecommendationConnection = {
  __typename?: 'RecommendationConnection';
  edges?: Maybe<Array<Maybe<RecommendationEdge>>>;
  nodes?: Maybe<Array<Maybe<Recommendation>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Recommendation connection edge */
export type RecommendationEdge = {
  __typename?: 'RecommendationEdge';
  node?: Maybe<Recommendation>;
};

/** Recommendation rating enums */
export enum RecommendationRating {
  NoRating = 'NO_RATING',
  RateDown = 'RATE_DOWN',
  RateUp = 'RATE_UP'
}

/** Recommendation sort enums */
export enum RecommendationSort {
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Rating = 'RATING',
  RatingDesc = 'RATING_DESC'
}

/** Notification for when new media is added to the site */
export type RelatedMediaAdditionNotification = {
  __typename?: 'RelatedMediaAdditionNotification';
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The associated media of the airing schedule */
  media?: Maybe<Media>;
  /** The id of the new media */
  mediaId: Scalars['Int'];
  /** The type of notification */
  type?: Maybe<NotificationType>;
};

export type Report = {
  __typename?: 'Report';
  cleared?: Maybe<Scalars['Boolean']>;
  /** When the entry data was created */
  createdAt?: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  reason?: Maybe<Scalars['String']>;
  reported?: Maybe<User>;
  reporter?: Maybe<User>;
};

/** A Review that features in an anime or manga */
export type Review = {
  __typename?: 'Review';
  /** The main review body text */
  body?: Maybe<Scalars['String']>;
  /** The time of the thread creation */
  createdAt: Scalars['Int'];
  /** The id of the review */
  id: Scalars['Int'];
  /** The media the review is of */
  media?: Maybe<Media>;
  /** The id of the review's media */
  mediaId: Scalars['Int'];
  /** For which type of media the review is for */
  mediaType?: Maybe<MediaType>;
  /** If the review is not yet publicly published and is only viewable by creator */
  private?: Maybe<Scalars['Boolean']>;
  /** The total user rating of the review */
  rating?: Maybe<Scalars['Int']>;
  /** The amount of user ratings of the review */
  ratingAmount?: Maybe<Scalars['Int']>;
  /** The review score of the media */
  score?: Maybe<Scalars['Int']>;
  /** The url for the review page on the AniList website */
  siteUrl?: Maybe<Scalars['String']>;
  /** A short summary of the review */
  summary?: Maybe<Scalars['String']>;
  /** The time of the thread last update */
  updatedAt: Scalars['Int'];
  /** The creator of the review */
  user?: Maybe<User>;
  /** The id of the review's creator */
  userId: Scalars['Int'];
  /** The rating of the review by currently authenticated user */
  userRating?: Maybe<ReviewRating>;
};


/** A Review that features in an anime or manga */
export type ReviewBodyArgs = {
  asHtml?: Maybe<Scalars['Boolean']>;
};

export type ReviewConnection = {
  __typename?: 'ReviewConnection';
  edges?: Maybe<Array<Maybe<ReviewEdge>>>;
  nodes?: Maybe<Array<Maybe<Review>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Review connection edge */
export type ReviewEdge = {
  __typename?: 'ReviewEdge';
  node?: Maybe<Review>;
};

/** Review rating enums */
export enum ReviewRating {
  DownVote = 'DOWN_VOTE',
  NoVote = 'NO_VOTE',
  UpVote = 'UP_VOTE'
}

/** Review sort enums */
export enum ReviewSort {
  CreatedAt = 'CREATED_AT',
  CreatedAtDesc = 'CREATED_AT_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Rating = 'RATING',
  RatingDesc = 'RATING_DESC',
  Score = 'SCORE',
  ScoreDesc = 'SCORE_DESC',
  UpdatedAt = 'UPDATED_AT',
  UpdatedAtDesc = 'UPDATED_AT_DESC'
}

/** Feed of mod edit activity */
export type RevisionHistory = {
  __typename?: 'RevisionHistory';
  /** The action taken on the objects */
  action?: Maybe<RevisionHistoryAction>;
  /** A JSON object of the fields that changed */
  changes?: Maybe<Scalars['Json']>;
  /** The character the mod feed entry references */
  character?: Maybe<Character>;
  /** When the mod feed entry was created */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the media */
  id: Scalars['Int'];
  /** The media the mod feed entry references */
  media?: Maybe<Media>;
  /** The staff member the mod feed entry references */
  staff?: Maybe<Staff>;
  /** The studio the mod feed entry references */
  studio?: Maybe<Studio>;
  /** The user who made the edit to the object */
  user?: Maybe<User>;
};

/** Revision history actions */
export enum RevisionHistoryAction {
  Create = 'CREATE',
  Edit = 'EDIT'
}

/** A user's list score distribution. */
export type ScoreDistribution = {
  __typename?: 'ScoreDistribution';
  /** The amount of list entries with this score */
  amount?: Maybe<Scalars['Int']>;
  score?: Maybe<Scalars['Int']>;
};

/** Media list scoring type */
export enum ScoreFormat {
  /** An integer from 0-10 */
  Point_10 = 'POINT_10',
  /** A float from 0-10 with 1 decimal place */
  Point_10Decimal = 'POINT_10_DECIMAL',
  /** An integer from 0-100 */
  Point_100 = 'POINT_100',
  /** An integer from 0-3. Should be represented in Smileys. 0 => No Score, 1 => :(, 2 => :|, 3 => :) */
  Point_3 = 'POINT_3',
  /** An integer from 0-5. Should be represented in Stars */
  Point_5 = 'POINT_5'
}

export type SiteStatistics = {
  __typename?: 'SiteStatistics';
  anime?: Maybe<SiteTrendConnection>;
  characters?: Maybe<SiteTrendConnection>;
  manga?: Maybe<SiteTrendConnection>;
  reviews?: Maybe<SiteTrendConnection>;
  staff?: Maybe<SiteTrendConnection>;
  studios?: Maybe<SiteTrendConnection>;
  users?: Maybe<SiteTrendConnection>;
};


export type SiteStatisticsAnimeArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<SiteTrendSort>>>;
};


export type SiteStatisticsCharactersArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<SiteTrendSort>>>;
};


export type SiteStatisticsMangaArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<SiteTrendSort>>>;
};


export type SiteStatisticsReviewsArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<SiteTrendSort>>>;
};


export type SiteStatisticsStaffArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<SiteTrendSort>>>;
};


export type SiteStatisticsStudiosArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<SiteTrendSort>>>;
};


export type SiteStatisticsUsersArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<SiteTrendSort>>>;
};

/** Daily site statistics */
export type SiteTrend = {
  __typename?: 'SiteTrend';
  /** The change from yesterday */
  change: Scalars['Int'];
  count: Scalars['Int'];
  /** The day the data was recorded (timestamp) */
  date: Scalars['Int'];
};

export type SiteTrendConnection = {
  __typename?: 'SiteTrendConnection';
  edges?: Maybe<Array<Maybe<SiteTrendEdge>>>;
  nodes?: Maybe<Array<Maybe<SiteTrend>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Site trend connection edge */
export type SiteTrendEdge = {
  __typename?: 'SiteTrendEdge';
  node?: Maybe<SiteTrend>;
};

/** Site trend sort enums */
export enum SiteTrendSort {
  Change = 'CHANGE',
  ChangeDesc = 'CHANGE_DESC',
  Count = 'COUNT',
  CountDesc = 'COUNT_DESC',
  Date = 'DATE',
  DateDesc = 'DATE_DESC'
}

/** Voice actors or production staff */
export type Staff = {
  __typename?: 'Staff';
  /** The person's age in years */
  age?: Maybe<Scalars['Int']>;
  /** The persons blood type */
  bloodType?: Maybe<Scalars['String']>;
  /** Media the actor voiced characters in. (Same data as characters with media as node instead of characters) */
  characterMedia?: Maybe<MediaConnection>;
  /** Characters voiced by the actor */
  characters?: Maybe<CharacterConnection>;
  dateOfBirth?: Maybe<FuzzyDate>;
  dateOfDeath?: Maybe<FuzzyDate>;
  /** A general description of the staff member */
  description?: Maybe<Scalars['String']>;
  /** The amount of user's who have favourited the staff member */
  favourites?: Maybe<Scalars['Int']>;
  /** The staff's gender. Usually Male, Female, or Non-binary but can be any string. */
  gender?: Maybe<Scalars['String']>;
  /** The persons birthplace or hometown */
  homeTown?: Maybe<Scalars['String']>;
  /** The id of the staff member */
  id: Scalars['Int'];
  /** The staff images */
  image?: Maybe<StaffImage>;
  /** If the staff member is marked as favourite by the currently authenticated user */
  isFavourite: Scalars['Boolean'];
  /** If the staff member is blocked from being added to favourites */
  isFavouriteBlocked: Scalars['Boolean'];
  /**
   * The primary language the staff member dub's in
   * @deprecated Replaced with languageV2
   */
  language?: Maybe<StaffLanguage>;
  /** The primary language of the staff member. Current values: Japanese, English, Korean, Italian, Spanish, Portuguese, French, German, Hebrew, Hungarian, Chinese, Arabic, Filipino, Catalan */
  languageV2?: Maybe<Scalars['String']>;
  /** Notes for site moderators */
  modNotes?: Maybe<Scalars['String']>;
  /** The names of the staff member */
  name?: Maybe<StaffName>;
  /** The person's primary occupations */
  primaryOccupations?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The url for the staff page on the AniList website */
  siteUrl?: Maybe<Scalars['String']>;
  /** Staff member that the submission is referencing */
  staff?: Maybe<Staff>;
  /** Media where the staff member has a production role */
  staffMedia?: Maybe<MediaConnection>;
  /** Inner details of submission status */
  submissionNotes?: Maybe<Scalars['String']>;
  /** Status of the submission */
  submissionStatus?: Maybe<Scalars['Int']>;
  /** Submitter for the submission */
  submitter?: Maybe<User>;
  /** @deprecated No data available */
  updatedAt?: Maybe<Scalars['Int']>;
  /** [startYear, endYear] (If the 2nd value is not present staff is still active) */
  yearsActive?: Maybe<Array<Maybe<Scalars['Int']>>>;
};


/** Voice actors or production staff */
export type StaffCharacterMediaArgs = {
  onList?: Maybe<Scalars['Boolean']>;
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<MediaSort>>>;
};


/** Voice actors or production staff */
export type StaffCharactersArgs = {
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<CharacterSort>>>;
};


/** Voice actors or production staff */
export type StaffDescriptionArgs = {
  asHtml?: Maybe<Scalars['Boolean']>;
};


/** Voice actors or production staff */
export type StaffStaffMediaArgs = {
  onList?: Maybe<Scalars['Boolean']>;
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<MediaSort>>>;
  type?: Maybe<MediaType>;
};

export type StaffConnection = {
  __typename?: 'StaffConnection';
  edges?: Maybe<Array<Maybe<StaffEdge>>>;
  nodes?: Maybe<Array<Maybe<Staff>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Staff connection edge */
export type StaffEdge = {
  __typename?: 'StaffEdge';
  /** The order the staff should be displayed from the users favourites */
  favouriteOrder?: Maybe<Scalars['Int']>;
  /** The id of the connection */
  id?: Maybe<Scalars['Int']>;
  node?: Maybe<Staff>;
  /** The role of the staff member in the production of the media */
  role?: Maybe<Scalars['String']>;
};

export type StaffImage = {
  __typename?: 'StaffImage';
  /** The person's image of media at its largest size */
  large?: Maybe<Scalars['String']>;
  /** The person's image of media at medium size */
  medium?: Maybe<Scalars['String']>;
};

/** The primary language of the voice actor */
export enum StaffLanguage {
  /** English */
  English = 'ENGLISH',
  /** French */
  French = 'FRENCH',
  /** German */
  German = 'GERMAN',
  /** Hebrew */
  Hebrew = 'HEBREW',
  /** Hungarian */
  Hungarian = 'HUNGARIAN',
  /** Italian */
  Italian = 'ITALIAN',
  /** Japanese */
  Japanese = 'JAPANESE',
  /** Korean */
  Korean = 'KOREAN',
  /** Portuguese */
  Portuguese = 'PORTUGUESE',
  /** Spanish */
  Spanish = 'SPANISH'
}

/** The names of the staff member */
export type StaffName = {
  __typename?: 'StaffName';
  /** Other names the staff member might be referred to as (pen names) */
  alternative?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The person's given name */
  first?: Maybe<Scalars['String']>;
  /** The person's first and last name */
  full?: Maybe<Scalars['String']>;
  /** The person's surname */
  last?: Maybe<Scalars['String']>;
  /** The person's middle name */
  middle?: Maybe<Scalars['String']>;
  /** The person's full name in their native language */
  native?: Maybe<Scalars['String']>;
  /** The currently authenticated users preferred name language. Default romaji for non-authenticated */
  userPreferred?: Maybe<Scalars['String']>;
};

/** The names of the staff member */
export type StaffNameInput = {
  /** Other names the character might be referred by */
  alternative?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The person's given name */
  first?: Maybe<Scalars['String']>;
  /** The person's surname */
  last?: Maybe<Scalars['String']>;
  /** The person's middle name */
  middle?: Maybe<Scalars['String']>;
  /** The person's full name in their native language */
  native?: Maybe<Scalars['String']>;
};

/** Voice actor role for a character */
export type StaffRoleType = {
  __typename?: 'StaffRoleType';
  /** Used for grouping roles where multiple dubs exist for the same language. Either dubbing company name or language variant. */
  dubGroup?: Maybe<Scalars['String']>;
  /** Notes regarding the VA's role for the character */
  roleNotes?: Maybe<Scalars['String']>;
  /** The voice actors of the character */
  voiceActor?: Maybe<Staff>;
};

/** Staff sort enums */
export enum StaffSort {
  Favourites = 'FAVOURITES',
  FavouritesDesc = 'FAVOURITES_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Language = 'LANGUAGE',
  LanguageDesc = 'LANGUAGE_DESC',
  /** Order manually decided by moderators */
  Relevance = 'RELEVANCE',
  Role = 'ROLE',
  RoleDesc = 'ROLE_DESC',
  SearchMatch = 'SEARCH_MATCH'
}

/** User's staff statistics */
export type StaffStats = {
  __typename?: 'StaffStats';
  amount?: Maybe<Scalars['Int']>;
  meanScore?: Maybe<Scalars['Int']>;
  staff?: Maybe<Staff>;
  /** The amount of time in minutes the staff member has been watched by the user */
  timeWatched?: Maybe<Scalars['Int']>;
};

/** A submission for a staff that features in an anime or manga */
export type StaffSubmission = {
  __typename?: 'StaffSubmission';
  /** Data Mod assigned to handle the submission */
  assignee?: Maybe<User>;
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the submission */
  id: Scalars['Int'];
  /** Whether the submission is locked */
  locked?: Maybe<Scalars['Boolean']>;
  /** Inner details of submission status */
  notes?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
  /** Staff that the submission is referencing */
  staff?: Maybe<Staff>;
  /** Status of the submission */
  status?: Maybe<SubmissionStatus>;
  /** The staff submission changes */
  submission?: Maybe<Staff>;
  /** Submitter for the submission */
  submitter?: Maybe<User>;
};

/** The distribution of the watching/reading status of media or a user's list */
export type StatusDistribution = {
  __typename?: 'StatusDistribution';
  /** The amount of entries with this status */
  amount?: Maybe<Scalars['Int']>;
  /** The day the activity took place (Unix timestamp) */
  status?: Maybe<MediaListStatus>;
};

/** Animation or production company */
export type Studio = {
  __typename?: 'Studio';
  /** The amount of user's who have favourited the studio */
  favourites?: Maybe<Scalars['Int']>;
  /** The id of the studio */
  id: Scalars['Int'];
  /** If the studio is an animation studio or a different kind of company */
  isAnimationStudio: Scalars['Boolean'];
  /** If the studio is marked as favourite by the currently authenticated user */
  isFavourite: Scalars['Boolean'];
  /** The media the studio has worked on */
  media?: Maybe<MediaConnection>;
  /** The name of the studio */
  name: Scalars['String'];
  /** The url for the studio page on the AniList website */
  siteUrl?: Maybe<Scalars['String']>;
};


/** Animation or production company */
export type StudioMediaArgs = {
  isMain?: Maybe<Scalars['Boolean']>;
  onList?: Maybe<Scalars['Boolean']>;
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<MediaSort>>>;
};

export type StudioConnection = {
  __typename?: 'StudioConnection';
  edges?: Maybe<Array<Maybe<StudioEdge>>>;
  nodes?: Maybe<Array<Maybe<Studio>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Studio connection edge */
export type StudioEdge = {
  __typename?: 'StudioEdge';
  /** The order the character should be displayed from the users favourites */
  favouriteOrder?: Maybe<Scalars['Int']>;
  /** The id of the connection */
  id?: Maybe<Scalars['Int']>;
  /** If the studio is the main animation studio of the anime */
  isMain: Scalars['Boolean'];
  node?: Maybe<Studio>;
};

/** Studio sort enums */
export enum StudioSort {
  Favourites = 'FAVOURITES',
  FavouritesDesc = 'FAVOURITES_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Name = 'NAME',
  NameDesc = 'NAME_DESC',
  SearchMatch = 'SEARCH_MATCH'
}

/** User's studio statistics */
export type StudioStats = {
  __typename?: 'StudioStats';
  amount?: Maybe<Scalars['Int']>;
  meanScore?: Maybe<Scalars['Int']>;
  studio?: Maybe<Studio>;
  /** The amount of time in minutes the studio's works have been watched by the user */
  timeWatched?: Maybe<Scalars['Int']>;
};

/** Submission sort enums */
export enum SubmissionSort {
  Id = 'ID',
  IdDesc = 'ID_DESC'
}

/** Submission status */
export enum SubmissionStatus {
  Accepted = 'ACCEPTED',
  PartiallyAccepted = 'PARTIALLY_ACCEPTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

/** User's tag statistics */
export type TagStats = {
  __typename?: 'TagStats';
  amount?: Maybe<Scalars['Int']>;
  meanScore?: Maybe<Scalars['Int']>;
  tag?: Maybe<MediaTag>;
  /** The amount of time in minutes the tag has been watched by the user */
  timeWatched?: Maybe<Scalars['Int']>;
};

/** User text activity */
export type TextActivity = {
  __typename?: 'TextActivity';
  /** The time the activity was created at */
  createdAt: Scalars['Int'];
  /** The id of the activity */
  id: Scalars['Int'];
  /** If the currently authenticated user liked the activity */
  isLiked?: Maybe<Scalars['Boolean']>;
  /** If the activity is locked and can receive replies */
  isLocked?: Maybe<Scalars['Boolean']>;
  /** If the currently authenticated user is subscribed to the activity */
  isSubscribed?: Maybe<Scalars['Boolean']>;
  /** The amount of likes the activity has */
  likeCount: Scalars['Int'];
  /** The users who liked the activity */
  likes?: Maybe<Array<Maybe<User>>>;
  /** The written replies to the activity */
  replies?: Maybe<Array<Maybe<ActivityReply>>>;
  /** The number of activity replies */
  replyCount: Scalars['Int'];
  /** The url for the activity page on the AniList website */
  siteUrl?: Maybe<Scalars['String']>;
  /** The status text (Markdown) */
  text?: Maybe<Scalars['String']>;
  /** The type of activity */
  type?: Maybe<ActivityType>;
  /** The user who created the activity */
  user?: Maybe<User>;
  /** The user id of the activity's creator */
  userId?: Maybe<Scalars['Int']>;
};


/** User text activity */
export type TextActivityTextArgs = {
  asHtml?: Maybe<Scalars['Boolean']>;
};

/** Forum Thread */
export type Thread = {
  __typename?: 'Thread';
  /** The text body of the thread (Markdown) */
  body?: Maybe<Scalars['String']>;
  /** The categories of the thread */
  categories?: Maybe<Array<Maybe<ThreadCategory>>>;
  /** The time of the thread creation */
  createdAt: Scalars['Int'];
  /** The id of the thread */
  id: Scalars['Int'];
  /** If the currently authenticated user liked the thread */
  isLiked?: Maybe<Scalars['Boolean']>;
  /** If the thread is locked and can receive comments */
  isLocked?: Maybe<Scalars['Boolean']>;
  /** If the thread is stickied and should be displayed at the top of the page */
  isSticky?: Maybe<Scalars['Boolean']>;
  /** If the currently authenticated user is subscribed to the thread */
  isSubscribed?: Maybe<Scalars['Boolean']>;
  /** The amount of likes the thread has */
  likeCount: Scalars['Int'];
  /** The users who liked the thread */
  likes?: Maybe<Array<Maybe<User>>>;
  /** The media categories of the thread */
  mediaCategories?: Maybe<Array<Maybe<Media>>>;
  /** The time of the last reply */
  repliedAt?: Maybe<Scalars['Int']>;
  /** The id of the most recent comment on the thread */
  replyCommentId?: Maybe<Scalars['Int']>;
  /** The number of comments on the thread */
  replyCount?: Maybe<Scalars['Int']>;
  /** The user to last reply to the thread */
  replyUser?: Maybe<User>;
  /** The id of the user who most recently commented on the thread */
  replyUserId?: Maybe<Scalars['Int']>;
  /** The url for the thread page on the AniList website */
  siteUrl?: Maybe<Scalars['String']>;
  /** The title of the thread */
  title?: Maybe<Scalars['String']>;
  /** The time of the thread last update */
  updatedAt: Scalars['Int'];
  /** The owner of the thread */
  user?: Maybe<User>;
  /** The id of the thread owner user */
  userId: Scalars['Int'];
  /** The number of times users have viewed the thread */
  viewCount?: Maybe<Scalars['Int']>;
};


/** Forum Thread */
export type ThreadBodyArgs = {
  asHtml?: Maybe<Scalars['Boolean']>;
};

/** A forum thread category */
export type ThreadCategory = {
  __typename?: 'ThreadCategory';
  /** The id of the category */
  id: Scalars['Int'];
  /** The name of the category */
  name: Scalars['String'];
};

/** Forum Thread Comment */
export type ThreadComment = {
  __typename?: 'ThreadComment';
  /** The comment's child reply comments */
  childComments?: Maybe<Scalars['Json']>;
  /** The text content of the comment (Markdown) */
  comment?: Maybe<Scalars['String']>;
  /** The time of the comments creation */
  createdAt: Scalars['Int'];
  /** The id of the comment */
  id: Scalars['Int'];
  /** If the currently authenticated user liked the comment */
  isLiked?: Maybe<Scalars['Boolean']>;
  /** If the comment tree is locked and may not receive replies or edits */
  isLocked?: Maybe<Scalars['Boolean']>;
  /** The amount of likes the comment has */
  likeCount: Scalars['Int'];
  /** The users who liked the comment */
  likes?: Maybe<Array<Maybe<User>>>;
  /** The url for the comment page on the AniList website */
  siteUrl?: Maybe<Scalars['String']>;
  /** The thread the comment belongs to */
  thread?: Maybe<Thread>;
  /** The id of thread the comment belongs to */
  threadId?: Maybe<Scalars['Int']>;
  /** The time of the comments last update */
  updatedAt: Scalars['Int'];
  /** The user who created the comment */
  user?: Maybe<User>;
  /** The user id of the comment's owner */
  userId?: Maybe<Scalars['Int']>;
};


/** Forum Thread Comment */
export type ThreadCommentCommentArgs = {
  asHtml?: Maybe<Scalars['Boolean']>;
};

/** Notification for when a thread comment is liked */
export type ThreadCommentLikeNotification = {
  __typename?: 'ThreadCommentLikeNotification';
  /** The thread comment that was liked */
  comment?: Maybe<ThreadComment>;
  /** The id of the activity which was liked */
  commentId: Scalars['Int'];
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The thread that the relevant comment belongs to */
  thread?: Maybe<Thread>;
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The user who liked the activity */
  user?: Maybe<User>;
  /** The id of the user who liked to the activity */
  userId: Scalars['Int'];
};

/** Notification for when authenticated user is @ mentioned in a forum thread comment */
export type ThreadCommentMentionNotification = {
  __typename?: 'ThreadCommentMentionNotification';
  /** The thread comment that included the @ mention */
  comment?: Maybe<ThreadComment>;
  /** The id of the comment where mentioned */
  commentId: Scalars['Int'];
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The thread that the relevant comment belongs to */
  thread?: Maybe<Thread>;
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The user who mentioned the authenticated user */
  user?: Maybe<User>;
  /** The id of the user who mentioned the authenticated user */
  userId: Scalars['Int'];
};

/** Notification for when a user replies to your forum thread comment */
export type ThreadCommentReplyNotification = {
  __typename?: 'ThreadCommentReplyNotification';
  /** The reply thread comment */
  comment?: Maybe<ThreadComment>;
  /** The id of the reply comment */
  commentId: Scalars['Int'];
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The thread that the relevant comment belongs to */
  thread?: Maybe<Thread>;
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The user who replied to the activity */
  user?: Maybe<User>;
  /** The id of the user who create the comment reply */
  userId: Scalars['Int'];
};

/** Thread comments sort enums */
export enum ThreadCommentSort {
  Id = 'ID',
  IdDesc = 'ID_DESC'
}

/** Notification for when a user replies to a subscribed forum thread */
export type ThreadCommentSubscribedNotification = {
  __typename?: 'ThreadCommentSubscribedNotification';
  /** The reply thread comment */
  comment?: Maybe<ThreadComment>;
  /** The id of the new comment in the subscribed thread */
  commentId: Scalars['Int'];
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The thread that the relevant comment belongs to */
  thread?: Maybe<Thread>;
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The user who replied to the subscribed thread */
  user?: Maybe<User>;
  /** The id of the user who commented on the thread */
  userId: Scalars['Int'];
};

/** Notification for when a thread is liked */
export type ThreadLikeNotification = {
  __typename?: 'ThreadLikeNotification';
  /** The liked thread comment */
  comment?: Maybe<ThreadComment>;
  /** The notification context text */
  context?: Maybe<Scalars['String']>;
  /** The time the notification was created at */
  createdAt?: Maybe<Scalars['Int']>;
  /** The id of the Notification */
  id: Scalars['Int'];
  /** The thread that the relevant comment belongs to */
  thread?: Maybe<Thread>;
  /** The id of the thread which was liked */
  threadId: Scalars['Int'];
  /** The type of notification */
  type?: Maybe<NotificationType>;
  /** The user who liked the activity */
  user?: Maybe<User>;
  /** The id of the user who liked to the activity */
  userId: Scalars['Int'];
};

/** Thread sort enums */
export enum ThreadSort {
  CreatedAt = 'CREATED_AT',
  CreatedAtDesc = 'CREATED_AT_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  IsSticky = 'IS_STICKY',
  RepliedAt = 'REPLIED_AT',
  RepliedAtDesc = 'REPLIED_AT_DESC',
  ReplyCount = 'REPLY_COUNT',
  ReplyCountDesc = 'REPLY_COUNT_DESC',
  SearchMatch = 'SEARCH_MATCH',
  Title = 'TITLE',
  TitleDesc = 'TITLE_DESC',
  UpdatedAt = 'UPDATED_AT',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  ViewCount = 'VIEW_COUNT',
  ViewCountDesc = 'VIEW_COUNT_DESC'
}

/** A user */
export type User = {
  __typename?: 'User';
  /** The bio written by user (Markdown) */
  about?: Maybe<Scalars['String']>;
  /** The user's avatar images */
  avatar?: Maybe<UserAvatar>;
  /** The user's banner images */
  bannerImage?: Maybe<Scalars['String']>;
  bans?: Maybe<Scalars['Json']>;
  /** When the user's account was created. (Does not exist for accounts created before 2020) */
  createdAt?: Maybe<Scalars['Int']>;
  /** Custom donation badge text */
  donatorBadge?: Maybe<Scalars['String']>;
  /** The donation tier of the user */
  donatorTier?: Maybe<Scalars['Int']>;
  /** The users favourites */
  favourites?: Maybe<Favourites>;
  /** The id of the user */
  id: Scalars['Int'];
  /** If the user is blocked by the authenticated user */
  isBlocked?: Maybe<Scalars['Boolean']>;
  /** If this user if following the authenticated user */
  isFollower?: Maybe<Scalars['Boolean']>;
  /** If the authenticated user if following this user */
  isFollowing?: Maybe<Scalars['Boolean']>;
  /** The user's media list options */
  mediaListOptions?: Maybe<MediaListOptions>;
  /** The user's moderator roles if they are a site moderator */
  moderatorRoles?: Maybe<Array<Maybe<ModRole>>>;
  /**
   * If the user is a moderator or data moderator
   * @deprecated Deprecated. Replaced with moderatorRoles field.
   */
  moderatorStatus?: Maybe<Scalars['String']>;
  /** The name of the user */
  name: Scalars['String'];
  /** The user's general options */
  options?: Maybe<UserOptions>;
  /** The user's previously used names. */
  previousNames?: Maybe<Array<Maybe<UserPreviousName>>>;
  /** The url for the user page on the AniList website */
  siteUrl?: Maybe<Scalars['String']>;
  /** The users anime & manga list statistics */
  statistics?: Maybe<UserStatisticTypes>;
  /**
   * The user's statistics
   * @deprecated Deprecated. Replaced with statistics field.
   */
  stats?: Maybe<UserStats>;
  /** The number of unread notifications the user has */
  unreadNotificationCount?: Maybe<Scalars['Int']>;
  /** When the user's data was last updated */
  updatedAt?: Maybe<Scalars['Int']>;
};


/** A user */
export type UserAboutArgs = {
  asHtml?: Maybe<Scalars['Boolean']>;
};


/** A user */
export type UserFavouritesArgs = {
  page?: Maybe<Scalars['Int']>;
};

/** A user's activity history stats. */
export type UserActivityHistory = {
  __typename?: 'UserActivityHistory';
  /** The amount of activity on the day */
  amount?: Maybe<Scalars['Int']>;
  /** The day the activity took place (Unix timestamp) */
  date?: Maybe<Scalars['Int']>;
  /** The level of activity represented on a 1-10 scale */
  level?: Maybe<Scalars['Int']>;
};

/** A user's avatars */
export type UserAvatar = {
  __typename?: 'UserAvatar';
  /** The avatar of user at its largest size */
  large?: Maybe<Scalars['String']>;
  /** The avatar of user at medium size */
  medium?: Maybe<Scalars['String']>;
};

export type UserCountryStatistic = {
  __typename?: 'UserCountryStatistic';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  country?: Maybe<Scalars['CountryCode']>;
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
};

export type UserFormatStatistic = {
  __typename?: 'UserFormatStatistic';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  format?: Maybe<MediaFormat>;
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
};

export type UserGenreStatistic = {
  __typename?: 'UserGenreStatistic';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  genre?: Maybe<Scalars['String']>;
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
};

export type UserLengthStatistic = {
  __typename?: 'UserLengthStatistic';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  length?: Maybe<Scalars['String']>;
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
};

/** User data for moderators */
export type UserModData = {
  __typename?: 'UserModData';
  alts?: Maybe<Array<Maybe<User>>>;
  bans?: Maybe<Scalars['Json']>;
  counts?: Maybe<Scalars['Json']>;
  email?: Maybe<Scalars['String']>;
  ip?: Maybe<Scalars['Json']>;
  privacy?: Maybe<Scalars['Int']>;
};

/** A user's general options */
export type UserOptions = {
  __typename?: 'UserOptions';
  /** Minutes between activity for them to be merged together. 0 is Never, Above 2 weeks (20160 mins) is Always. */
  activityMergeTime?: Maybe<Scalars['Int']>;
  /** Whether the user receives notifications when a show they are watching aires */
  airingNotifications?: Maybe<Scalars['Boolean']>;
  /** Whether the user has enabled viewing of 18+ content */
  displayAdultContent?: Maybe<Scalars['Boolean']>;
  /** Notification options */
  notificationOptions?: Maybe<Array<Maybe<NotificationOption>>>;
  /** Profile highlight color (blue, purple, pink, orange, red, green, gray) */
  profileColor?: Maybe<Scalars['String']>;
  /** The language the user wants to see staff and character names in */
  staffNameLanguage?: Maybe<UserStaffNameLanguage>;
  /** The user's timezone offset (Auth user only) */
  timezone?: Maybe<Scalars['String']>;
  /** The language the user wants to see media titles in */
  titleLanguage?: Maybe<UserTitleLanguage>;
};

/** A user's previous name */
export type UserPreviousName = {
  __typename?: 'UserPreviousName';
  /** When the user first changed from this name. */
  createdAt?: Maybe<Scalars['Int']>;
  /** A previous name of the user. */
  name?: Maybe<Scalars['String']>;
  /** When the user most recently changed from this name. */
  updatedAt?: Maybe<Scalars['Int']>;
};

export type UserReleaseYearStatistic = {
  __typename?: 'UserReleaseYearStatistic';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
  releaseYear?: Maybe<Scalars['Int']>;
};

export type UserScoreStatistic = {
  __typename?: 'UserScoreStatistic';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
  score?: Maybe<Scalars['Int']>;
};

/** User sort enums */
export enum UserSort {
  ChaptersRead = 'CHAPTERS_READ',
  ChaptersReadDesc = 'CHAPTERS_READ_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  SearchMatch = 'SEARCH_MATCH',
  Username = 'USERNAME',
  UsernameDesc = 'USERNAME_DESC',
  WatchedTime = 'WATCHED_TIME',
  WatchedTimeDesc = 'WATCHED_TIME_DESC'
}

/** The language the user wants to see staff and character names in */
export enum UserStaffNameLanguage {
  /** The staff or character's name in their native language */
  Native = 'NATIVE',
  /** The romanization of the staff or character's native name */
  Romaji = 'ROMAJI',
  /** The romanization of the staff or character's native name, with western name ordering */
  RomajiWestern = 'ROMAJI_WESTERN'
}

export type UserStaffStatistic = {
  __typename?: 'UserStaffStatistic';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
  staff?: Maybe<Staff>;
};

export type UserStartYearStatistic = {
  __typename?: 'UserStartYearStatistic';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
  startYear?: Maybe<Scalars['Int']>;
};

export type UserStatistics = {
  __typename?: 'UserStatistics';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  countries?: Maybe<Array<Maybe<UserCountryStatistic>>>;
  episodesWatched: Scalars['Int'];
  formats?: Maybe<Array<Maybe<UserFormatStatistic>>>;
  genres?: Maybe<Array<Maybe<UserGenreStatistic>>>;
  lengths?: Maybe<Array<Maybe<UserLengthStatistic>>>;
  meanScore: Scalars['Float'];
  minutesWatched: Scalars['Int'];
  releaseYears?: Maybe<Array<Maybe<UserReleaseYearStatistic>>>;
  scores?: Maybe<Array<Maybe<UserScoreStatistic>>>;
  staff?: Maybe<Array<Maybe<UserStaffStatistic>>>;
  standardDeviation: Scalars['Float'];
  startYears?: Maybe<Array<Maybe<UserStartYearStatistic>>>;
  statuses?: Maybe<Array<Maybe<UserStatusStatistic>>>;
  studios?: Maybe<Array<Maybe<UserStudioStatistic>>>;
  tags?: Maybe<Array<Maybe<UserTagStatistic>>>;
  voiceActors?: Maybe<Array<Maybe<UserVoiceActorStatistic>>>;
  volumesRead: Scalars['Int'];
};


export type UserStatisticsCountriesArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};


export type UserStatisticsFormatsArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};


export type UserStatisticsGenresArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};


export type UserStatisticsLengthsArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};


export type UserStatisticsReleaseYearsArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};


export type UserStatisticsScoresArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};


export type UserStatisticsStaffArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};


export type UserStatisticsStartYearsArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};


export type UserStatisticsStatusesArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};


export type UserStatisticsStudiosArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};


export type UserStatisticsTagsArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};


export type UserStatisticsVoiceActorsArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<Maybe<UserStatisticsSort>>>;
};

/** User statistics sort enum */
export enum UserStatisticsSort {
  Count = 'COUNT',
  CountDesc = 'COUNT_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  MeanScore = 'MEAN_SCORE',
  MeanScoreDesc = 'MEAN_SCORE_DESC',
  Progress = 'PROGRESS',
  ProgressDesc = 'PROGRESS_DESC'
}

export type UserStatisticTypes = {
  __typename?: 'UserStatisticTypes';
  anime?: Maybe<UserStatistics>;
  manga?: Maybe<UserStatistics>;
};

/** A user's statistics */
export type UserStats = {
  __typename?: 'UserStats';
  activityHistory?: Maybe<Array<Maybe<UserActivityHistory>>>;
  animeListScores?: Maybe<ListScoreStats>;
  animeScoreDistribution?: Maybe<Array<Maybe<ScoreDistribution>>>;
  animeStatusDistribution?: Maybe<Array<Maybe<StatusDistribution>>>;
  /** The amount of manga chapters the user has read */
  chaptersRead?: Maybe<Scalars['Int']>;
  favouredActors?: Maybe<Array<Maybe<StaffStats>>>;
  favouredFormats?: Maybe<Array<Maybe<FormatStats>>>;
  favouredGenres?: Maybe<Array<Maybe<GenreStats>>>;
  favouredGenresOverview?: Maybe<Array<Maybe<GenreStats>>>;
  favouredStaff?: Maybe<Array<Maybe<StaffStats>>>;
  favouredStudios?: Maybe<Array<Maybe<StudioStats>>>;
  favouredTags?: Maybe<Array<Maybe<TagStats>>>;
  favouredYears?: Maybe<Array<Maybe<YearStats>>>;
  mangaListScores?: Maybe<ListScoreStats>;
  mangaScoreDistribution?: Maybe<Array<Maybe<ScoreDistribution>>>;
  mangaStatusDistribution?: Maybe<Array<Maybe<StatusDistribution>>>;
  /** The amount of anime the user has watched in minutes */
  watchedTime?: Maybe<Scalars['Int']>;
};

export type UserStatusStatistic = {
  __typename?: 'UserStatusStatistic';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
  status?: Maybe<MediaListStatus>;
};

export type UserStudioStatistic = {
  __typename?: 'UserStudioStatistic';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
  studio?: Maybe<Studio>;
};

export type UserTagStatistic = {
  __typename?: 'UserTagStatistic';
  chaptersRead: Scalars['Int'];
  count: Scalars['Int'];
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
  tag?: Maybe<MediaTag>;
};

/** The language the user wants to see media titles in */
export enum UserTitleLanguage {
  /** The official english title */
  English = 'ENGLISH',
  /** The official english title, stylised by media creator */
  EnglishStylised = 'ENGLISH_STYLISED',
  /** Official title in it's native language */
  Native = 'NATIVE',
  /** Official title in it's native language, stylised by media creator */
  NativeStylised = 'NATIVE_STYLISED',
  /** The romanization of the native language title */
  Romaji = 'ROMAJI',
  /** The romanization of the native language title, stylised by media creator */
  RomajiStylised = 'ROMAJI_STYLISED'
}

export type UserVoiceActorStatistic = {
  __typename?: 'UserVoiceActorStatistic';
  chaptersRead: Scalars['Int'];
  characterIds: Array<Maybe<Scalars['Int']>>;
  count: Scalars['Int'];
  meanScore: Scalars['Float'];
  mediaIds: Array<Maybe<Scalars['Int']>>;
  minutesWatched: Scalars['Int'];
  voiceActor?: Maybe<Staff>;
};

/** User's year statistics */
export type YearStats = {
  __typename?: 'YearStats';
  amount?: Maybe<Scalars['Int']>;
  meanScore?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export type AnimeRelationFragmentFragment = (
  { __typename?: 'Media' }
  & Pick<Media, 'id' | 'isFavourite' | 'type' | 'format'>
  & { title?: Maybe<(
    { __typename?: 'MediaTitle' }
    & Pick<MediaTitle, 'romaji' | 'native' | 'english'>
  )>, coverImage?: Maybe<(
    { __typename?: 'MediaCoverImage' }
    & Pick<MediaCoverImage, 'large' | 'medium' | 'color'>
  )> }
);

export type StreamingLinkDataFragment = (
  { __typename?: 'MediaStreamingEpisode' }
  & Pick<MediaStreamingEpisode, 'title' | 'thumbnail' | 'url' | 'site'>
);

export type MediaExternalLinkDataFragment = (
  { __typename?: 'MediaExternalLink' }
  & Pick<MediaExternalLink, 'id' | 'url' | 'site'>
);

export type MediaTrailerDataFragment = (
  { __typename?: 'MediaTrailer' }
  & Pick<MediaTrailer, 'id' | 'thumbnail' | 'site'>
);

export type AnimeFragmentFragment = (
  { __typename?: 'Media' }
  & Pick<Media, 'id' | 'status' | 'genres' | 'duration' | 'episodes' | 'description' | 'isFavourite' | 'averageScore'>
  & { title?: Maybe<(
    { __typename?: 'MediaTitle' }
    & Pick<MediaTitle, 'romaji' | 'native' | 'english'>
  )>, startDate?: Maybe<(
    { __typename?: 'FuzzyDate' }
    & Pick<FuzzyDate, 'year' | 'month' | 'day'>
  )>, endDate?: Maybe<(
    { __typename?: 'FuzzyDate' }
    & Pick<FuzzyDate, 'year' | 'month' | 'day'>
  )>, coverImage?: Maybe<(
    { __typename?: 'MediaCoverImage' }
    & Pick<MediaCoverImage, 'large' | 'medium' | 'color'>
  )>, trailer?: Maybe<(
    { __typename?: 'MediaTrailer' }
    & MediaTrailerDataFragment
  )>, streamingEpisodes?: Maybe<Array<Maybe<(
    { __typename?: 'MediaStreamingEpisode' }
    & StreamingLinkDataFragment
  )>>>, externalLinks?: Maybe<Array<Maybe<(
    { __typename?: 'MediaExternalLink' }
    & MediaExternalLinkDataFragment
  )>>>, nextAiringEpisode?: Maybe<(
    { __typename?: 'AiringSchedule' }
    & Pick<AiringSchedule, 'id' | 'airingAt' | 'episode' | 'timeUntilAiring'>
  )>, mediaListEntry?: Maybe<(
    { __typename?: 'MediaList' }
    & Pick<MediaList, 'progress' | 'status' | 'score' | 'id'>
  )>, relations?: Maybe<(
    { __typename?: 'MediaConnection' }
    & { edges?: Maybe<Array<Maybe<(
      { __typename?: 'MediaEdge' }
      & Pick<MediaEdge, 'id' | 'relationType'>
      & { node?: Maybe<(
        { __typename?: 'Media' }
        & AnimeRelationFragmentFragment
      )> }
    )>>> }
  )>, characters?: Maybe<(
    { __typename?: 'CharacterConnection' }
    & { edges?: Maybe<Array<Maybe<(
      { __typename?: 'CharacterEdge' }
      & Pick<CharacterEdge, 'id' | 'role'>
      & { node?: Maybe<(
        { __typename?: 'Character' }
        & CharacterDataFragment
      )> }
    )>>>, nodes?: Maybe<Array<Maybe<(
      { __typename?: 'Character' }
      & CharacterDataFragment
    )>>> }
  )> }
);

export type CharacterDataFragment = (
  { __typename?: 'Character' }
  & Pick<Character, 'id' | 'isFavourite' | 'description' | 'siteUrl'>
  & { name?: Maybe<(
    { __typename?: 'CharacterName' }
    & Pick<CharacterName, 'first' | 'last' | 'full' | 'native' | 'alternative'>
  )>, image?: Maybe<(
    { __typename?: 'CharacterImage' }
    & Pick<CharacterImage, 'large' | 'medium'>
  )> }
);

export type ToggleFavoriteMutationVariables = Exact<{
  animeId?: Maybe<Scalars['Int']>;
  characterId?: Maybe<Scalars['Int']>;
}>;


export type ToggleFavoriteMutation = (
  { __typename?: 'Mutation' }
  & { ToggleFavourite?: Maybe<(
    { __typename?: 'Favourites' }
    & FavouritesDataFragment
  )> }
);

export type FavouritesDataFragment = (
  { __typename?: 'Favourites' }
  & { anime?: Maybe<(
    { __typename?: 'MediaConnection' }
    & { pageInfo?: Maybe<(
      { __typename?: 'PageInfo' }
      & Pick<PageInfo, 'total'>
    )> }
  )>, characters?: Maybe<(
    { __typename?: 'CharacterConnection' }
    & { pageInfo?: Maybe<(
      { __typename?: 'PageInfo' }
      & Pick<PageInfo, 'total'>
    )> }
  )> }
);

export type UpdateProgressMutationVariables = Exact<{
  id?: Maybe<Scalars['Int']>;
  progress?: Maybe<Scalars['Int']>;
}>;


export type UpdateProgressMutation = (
  { __typename?: 'Mutation' }
  & { SaveMediaListEntry?: Maybe<(
    { __typename?: 'MediaList' }
    & Pick<MediaList, 'id'>
  )> }
);

export type UpdateScoreMutationVariables = Exact<{
  id?: Maybe<Scalars['Int']>;
  scoreRaw?: Maybe<Scalars['Int']>;
}>;


export type UpdateScoreMutation = (
  { __typename?: 'Mutation' }
  & { SaveMediaListEntry?: Maybe<(
    { __typename?: 'MediaList' }
    & Pick<MediaList, 'id'>
  )> }
);

export type UpdateStatusMutationVariables = Exact<{
  mediaId?: Maybe<Scalars['Int']>;
  status?: Maybe<MediaListStatus>;
}>;


export type UpdateStatusMutation = (
  { __typename?: 'Mutation' }
  & { SaveMediaListEntry?: Maybe<(
    { __typename?: 'MediaList' }
    & Pick<MediaList, 'id'>
  )> }
);

export type GetAnimeQueryVariables = Exact<{
  id?: Maybe<Scalars['Int']>;
}>;


export type GetAnimeQuery = (
  { __typename?: 'Query' }
  & { Media?: Maybe<(
    { __typename?: 'Media' }
    & AnimeFragmentFragment
  )> }
);

export type GetAnimeListQueryVariables = Exact<{
  userId?: Maybe<Scalars['Int']>;
  status?: Maybe<MediaListStatus>;
  sort?: Maybe<Array<Maybe<MediaListSort>>>;
}>;


export type GetAnimeListQuery = (
  { __typename?: 'Query' }
  & { MediaListCollection?: Maybe<(
    { __typename?: 'MediaListCollection' }
    & Pick<MediaListCollection, 'hasNextChunk'>
    & { lists?: Maybe<Array<Maybe<(
      { __typename?: 'MediaListGroup' }
      & { entries?: Maybe<Array<Maybe<(
        { __typename?: 'MediaList' }
        & Pick<MediaList, 'id' | 'mediaId' | 'score' | 'progress'>
        & { media?: Maybe<(
          { __typename?: 'Media' }
          & AnimeFragmentFragment
        )> }
      )>>> }
    )>>> }
  )> }
);

export type AiringNotificationFragmentFragment = (
  { __typename?: 'AiringNotification' }
  & Pick<AiringNotification, 'id' | 'type' | 'animeId' | 'episode' | 'contexts' | 'createdAt'>
  & { media?: Maybe<(
    { __typename?: 'Media' }
    & AnimeRelationFragmentFragment
  )> }
);

export type GetAnimeNotificationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAnimeNotificationsQuery = (
  { __typename?: 'Query' }
  & { Page?: Maybe<(
    { __typename?: 'Page' }
    & { pageInfo?: Maybe<(
      { __typename?: 'PageInfo' }
      & Pick<PageInfo, 'total' | 'perPage' | 'currentPage' | 'lastPage' | 'hasNextPage'>
    )>, notifications?: Maybe<Array<Maybe<{ __typename: 'ActivityLikeNotification' } | { __typename: 'ActivityMentionNotification' } | { __typename: 'ActivityMessageNotification' } | { __typename: 'ActivityReplyLikeNotification' } | { __typename: 'ActivityReplyNotification' } | { __typename: 'ActivityReplySubscribedNotification' } | (
      { __typename: 'AiringNotification' }
      & AiringNotificationFragmentFragment
    ) | { __typename: 'FollowingNotification' } | { __typename: 'MediaDataChangeNotification' } | { __typename: 'MediaDeletionNotification' } | { __typename: 'MediaMergeNotification' } | { __typename: 'RelatedMediaAdditionNotification' } | { __typename: 'ThreadCommentLikeNotification' } | { __typename: 'ThreadCommentMentionNotification' } | { __typename: 'ThreadCommentReplyNotification' } | { __typename: 'ThreadCommentSubscribedNotification' } | { __typename: 'ThreadLikeNotification' }>>> }
  )> }
);

export type GetTrendingAnimeQueryVariables = Exact<{
  page?: Maybe<Scalars['Int']>;
  perPage?: Maybe<Scalars['Int']>;
}>;


export type GetTrendingAnimeQuery = (
  { __typename?: 'Query' }
  & { Page?: Maybe<(
    { __typename?: 'Page' }
    & { pageInfo?: Maybe<(
      { __typename?: 'PageInfo' }
      & Pick<PageInfo, 'hasNextPage' | 'total'>
    )>, media?: Maybe<Array<Maybe<(
      { __typename?: 'Media' }
      & AnimeFragmentFragment
    )>>> }
  )> }
);

export type SearchAnimeQueryVariables = Exact<{
  search?: Maybe<Scalars['String']>;
}>;


export type SearchAnimeQuery = (
  { __typename?: 'Query' }
  & { Page?: Maybe<(
    { __typename?: 'Page' }
    & { pageInfo?: Maybe<(
      { __typename?: 'PageInfo' }
      & Pick<PageInfo, 'hasNextPage' | 'total'>
    )>, media?: Maybe<Array<Maybe<(
      { __typename?: 'Media' }
      & AnimeFragmentFragment
    )>>> }
  )> }
);

export type GetCharacterQueryVariables = Exact<{
  id?: Maybe<Scalars['Int']>;
}>;


export type GetCharacterQuery = (
  { __typename?: 'Query' }
  & { Character?: Maybe<(
    { __typename?: 'Character' }
    & CharacterDataFragment
  )> }
);

export type GetViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type GetViewerQuery = (
  { __typename?: 'Query' }
  & { Viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'name'>
    & { avatar?: Maybe<(
      { __typename?: 'UserAvatar' }
      & Pick<UserAvatar, 'large' | 'medium'>
    )>, favourites?: Maybe<(
      { __typename?: 'Favourites' }
      & { anime?: Maybe<(
        { __typename?: 'MediaConnection' }
        & { nodes?: Maybe<Array<Maybe<(
          { __typename?: 'Media' }
          & Pick<Media, 'id'>
          & { title?: Maybe<(
            { __typename?: 'MediaTitle' }
            & Pick<MediaTitle, 'english' | 'romaji' | 'native'>
          )>, coverImage?: Maybe<(
            { __typename?: 'MediaCoverImage' }
            & Pick<MediaCoverImage, 'large' | 'medium'>
          )> }
        )>>> }
      )>, characters?: Maybe<(
        { __typename?: 'CharacterConnection' }
        & { nodes?: Maybe<Array<Maybe<(
          { __typename?: 'Character' }
          & Pick<Character, 'id'>
          & { name?: Maybe<(
            { __typename?: 'CharacterName' }
            & Pick<CharacterName, 'full'>
          )>, image?: Maybe<(
            { __typename?: 'CharacterImage' }
            & Pick<CharacterImage, 'large' | 'medium'>
          )> }
        )>>> }
      )> }
    )>, statistics?: Maybe<(
      { __typename?: 'UserStatisticTypes' }
      & { anime?: Maybe<(
        { __typename?: 'UserStatistics' }
        & Pick<UserStatistics, 'count' | 'minutesWatched'>
      )>, manga?: Maybe<(
        { __typename?: 'UserStatistics' }
        & Pick<UserStatistics, 'count' | 'chaptersRead'>
      )> }
    )> }
  )> }
);

export const MediaTrailerDataFragmentDoc = gql`
    fragment MediaTrailerData on MediaTrailer {
  id
  thumbnail
  site
}
    `;
export const StreamingLinkDataFragmentDoc = gql`
    fragment StreamingLinkData on MediaStreamingEpisode {
  title
  thumbnail
  url
  site
}
    `;
export const MediaExternalLinkDataFragmentDoc = gql`
    fragment MediaExternalLinkData on MediaExternalLink {
  id
  url
  site
}
    `;
export const AnimeRelationFragmentFragmentDoc = gql`
    fragment AnimeRelationFragment on Media {
  id
  isFavourite
  title {
    romaji
    native
    english
  }
  type
  format
  coverImage {
    large
    medium
    color
  }
}
    `;
export const CharacterDataFragmentDoc = gql`
    fragment CharacterData on Character {
  id
  isFavourite
  name {
    first
    last
    full
    native
    alternative
  }
  image {
    large
    medium
  }
  description
  siteUrl
}
    `;
export const AnimeFragmentFragmentDoc = gql`
    fragment AnimeFragment on Media {
  id
  title {
    romaji
    native
    english
  }
  startDate {
    year
    month
    day
  }
  endDate {
    year
    month
    day
  }
  status
  genres
  duration
  episodes
  description
  isFavourite
  averageScore
  coverImage {
    large
    medium
    color
  }
  trailer {
    ...MediaTrailerData
  }
  streamingEpisodes {
    ...StreamingLinkData
  }
  externalLinks {
    ...MediaExternalLinkData
  }
  nextAiringEpisode {
    id
    airingAt
    episode
    timeUntilAiring
  }
  mediaListEntry {
    progress
    status
    score(format: POINT_10)
    id
  }
  relations {
    edges {
      id
      relationType
      node {
        ...AnimeRelationFragment
      }
    }
  }
  characters {
    edges {
      id
      role
      node {
        ...CharacterData
      }
    }
    nodes {
      ...CharacterData
    }
  }
}
    ${MediaTrailerDataFragmentDoc}
${StreamingLinkDataFragmentDoc}
${MediaExternalLinkDataFragmentDoc}
${AnimeRelationFragmentFragmentDoc}
${CharacterDataFragmentDoc}`;
export const FavouritesDataFragmentDoc = gql`
    fragment FavouritesData on Favourites {
  anime {
    pageInfo {
      total
    }
  }
  characters {
    pageInfo {
      total
    }
  }
}
    `;
export const AiringNotificationFragmentFragmentDoc = gql`
    fragment AiringNotificationFragment on AiringNotification {
  id
  type
  animeId
  episode
  contexts
  createdAt
  media {
    ...AnimeRelationFragment
  }
}
    ${AnimeRelationFragmentFragmentDoc}`;
export const ToggleFavoriteDocument = gql`
    mutation ToggleFavorite($animeId: Int, $characterId: Int) {
  ToggleFavourite(animeId: $animeId, characterId: $characterId) {
    ...FavouritesData
  }
}
    ${FavouritesDataFragmentDoc}`;
export type ToggleFavoriteMutationFn = Apollo.MutationFunction<ToggleFavoriteMutation, ToggleFavoriteMutationVariables>;

/**
 * __useToggleFavoriteMutation__
 *
 * To run a mutation, you first call `useToggleFavoriteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleFavoriteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleFavoriteMutation, { data, loading, error }] = useToggleFavoriteMutation({
 *   variables: {
 *      animeId: // value for 'animeId'
 *      characterId: // value for 'characterId'
 *   },
 * });
 */
export function useToggleFavoriteMutation(baseOptions?: Apollo.MutationHookOptions<ToggleFavoriteMutation, ToggleFavoriteMutationVariables>) {
        return Apollo.useMutation<ToggleFavoriteMutation, ToggleFavoriteMutationVariables>(ToggleFavoriteDocument, baseOptions);
      }
export type ToggleFavoriteMutationHookResult = ReturnType<typeof useToggleFavoriteMutation>;
export type ToggleFavoriteMutationResult = Apollo.MutationResult<ToggleFavoriteMutation>;
export type ToggleFavoriteMutationOptions = Apollo.BaseMutationOptions<ToggleFavoriteMutation, ToggleFavoriteMutationVariables>;
export const UpdateProgressDocument = gql`
    mutation UpdateProgress($id: Int, $progress: Int) {
  SaveMediaListEntry(id: $id, progress: $progress) {
    id
  }
}
    `;
export type UpdateProgressMutationFn = Apollo.MutationFunction<UpdateProgressMutation, UpdateProgressMutationVariables>;

/**
 * __useUpdateProgressMutation__
 *
 * To run a mutation, you first call `useUpdateProgressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProgressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProgressMutation, { data, loading, error }] = useUpdateProgressMutation({
 *   variables: {
 *      id: // value for 'id'
 *      progress: // value for 'progress'
 *   },
 * });
 */
export function useUpdateProgressMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProgressMutation, UpdateProgressMutationVariables>) {
        return Apollo.useMutation<UpdateProgressMutation, UpdateProgressMutationVariables>(UpdateProgressDocument, baseOptions);
      }
export type UpdateProgressMutationHookResult = ReturnType<typeof useUpdateProgressMutation>;
export type UpdateProgressMutationResult = Apollo.MutationResult<UpdateProgressMutation>;
export type UpdateProgressMutationOptions = Apollo.BaseMutationOptions<UpdateProgressMutation, UpdateProgressMutationVariables>;
export const UpdateScoreDocument = gql`
    mutation UpdateScore($id: Int, $scoreRaw: Int) {
  SaveMediaListEntry(id: $id, scoreRaw: $scoreRaw) {
    id
  }
}
    `;
export type UpdateScoreMutationFn = Apollo.MutationFunction<UpdateScoreMutation, UpdateScoreMutationVariables>;

/**
 * __useUpdateScoreMutation__
 *
 * To run a mutation, you first call `useUpdateScoreMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateScoreMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateScoreMutation, { data, loading, error }] = useUpdateScoreMutation({
 *   variables: {
 *      id: // value for 'id'
 *      scoreRaw: // value for 'scoreRaw'
 *   },
 * });
 */
export function useUpdateScoreMutation(baseOptions?: Apollo.MutationHookOptions<UpdateScoreMutation, UpdateScoreMutationVariables>) {
        return Apollo.useMutation<UpdateScoreMutation, UpdateScoreMutationVariables>(UpdateScoreDocument, baseOptions);
      }
export type UpdateScoreMutationHookResult = ReturnType<typeof useUpdateScoreMutation>;
export type UpdateScoreMutationResult = Apollo.MutationResult<UpdateScoreMutation>;
export type UpdateScoreMutationOptions = Apollo.BaseMutationOptions<UpdateScoreMutation, UpdateScoreMutationVariables>;
export const UpdateStatusDocument = gql`
    mutation UpdateStatus($mediaId: Int, $status: MediaListStatus) {
  SaveMediaListEntry(mediaId: $mediaId, status: $status) {
    id
  }
}
    `;
export type UpdateStatusMutationFn = Apollo.MutationFunction<UpdateStatusMutation, UpdateStatusMutationVariables>;

/**
 * __useUpdateStatusMutation__
 *
 * To run a mutation, you first call `useUpdateStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateStatusMutation, { data, loading, error }] = useUpdateStatusMutation({
 *   variables: {
 *      mediaId: // value for 'mediaId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateStatusMutation, UpdateStatusMutationVariables>) {
        return Apollo.useMutation<UpdateStatusMutation, UpdateStatusMutationVariables>(UpdateStatusDocument, baseOptions);
      }
export type UpdateStatusMutationHookResult = ReturnType<typeof useUpdateStatusMutation>;
export type UpdateStatusMutationResult = Apollo.MutationResult<UpdateStatusMutation>;
export type UpdateStatusMutationOptions = Apollo.BaseMutationOptions<UpdateStatusMutation, UpdateStatusMutationVariables>;
export const GetAnimeDocument = gql`
    query GetAnime($id: Int) {
  Media(id: $id) {
    ...AnimeFragment
  }
}
    ${AnimeFragmentFragmentDoc}`;

/**
 * __useGetAnimeQuery__
 *
 * To run a query within a React component, call `useGetAnimeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnimeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnimeQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetAnimeQuery(baseOptions?: Apollo.QueryHookOptions<GetAnimeQuery, GetAnimeQueryVariables>) {
        return Apollo.useQuery<GetAnimeQuery, GetAnimeQueryVariables>(GetAnimeDocument, baseOptions);
      }
export function useGetAnimeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAnimeQuery, GetAnimeQueryVariables>) {
          return Apollo.useLazyQuery<GetAnimeQuery, GetAnimeQueryVariables>(GetAnimeDocument, baseOptions);
        }
export type GetAnimeQueryHookResult = ReturnType<typeof useGetAnimeQuery>;
export type GetAnimeLazyQueryHookResult = ReturnType<typeof useGetAnimeLazyQuery>;
export type GetAnimeQueryResult = Apollo.QueryResult<GetAnimeQuery, GetAnimeQueryVariables>;
export function refetchGetAnimeQuery(variables?: GetAnimeQueryVariables) {
      return { query: GetAnimeDocument, variables: variables }
    }
export const GetAnimeListDocument = gql`
    query GetAnimeList($userId: Int, $status: MediaListStatus, $sort: [MediaListSort]) {
  MediaListCollection(userId: $userId, type: ANIME, status: $status, sort: $sort) {
    lists {
      entries {
        id
        mediaId
        score
        progress
        media {
          ...AnimeFragment
        }
      }
    }
    hasNextChunk
  }
}
    ${AnimeFragmentFragmentDoc}`;

/**
 * __useGetAnimeListQuery__
 *
 * To run a query within a React component, call `useGetAnimeListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnimeListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnimeListQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      status: // value for 'status'
 *      sort: // value for 'sort'
 *   },
 * });
 */
export function useGetAnimeListQuery(baseOptions?: Apollo.QueryHookOptions<GetAnimeListQuery, GetAnimeListQueryVariables>) {
        return Apollo.useQuery<GetAnimeListQuery, GetAnimeListQueryVariables>(GetAnimeListDocument, baseOptions);
      }
export function useGetAnimeListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAnimeListQuery, GetAnimeListQueryVariables>) {
          return Apollo.useLazyQuery<GetAnimeListQuery, GetAnimeListQueryVariables>(GetAnimeListDocument, baseOptions);
        }
export type GetAnimeListQueryHookResult = ReturnType<typeof useGetAnimeListQuery>;
export type GetAnimeListLazyQueryHookResult = ReturnType<typeof useGetAnimeListLazyQuery>;
export type GetAnimeListQueryResult = Apollo.QueryResult<GetAnimeListQuery, GetAnimeListQueryVariables>;
export function refetchGetAnimeListQuery(variables?: GetAnimeListQueryVariables) {
      return { query: GetAnimeListDocument, variables: variables }
    }
export const GetAnimeNotificationsDocument = gql`
    query GetAnimeNotifications {
  Page(page: 1, perPage: 100) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    notifications(type: AIRING) {
      __typename
      ...AiringNotificationFragment
    }
  }
}
    ${AiringNotificationFragmentFragmentDoc}`;

/**
 * __useGetAnimeNotificationsQuery__
 *
 * To run a query within a React component, call `useGetAnimeNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnimeNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnimeNotificationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAnimeNotificationsQuery(baseOptions?: Apollo.QueryHookOptions<GetAnimeNotificationsQuery, GetAnimeNotificationsQueryVariables>) {
        return Apollo.useQuery<GetAnimeNotificationsQuery, GetAnimeNotificationsQueryVariables>(GetAnimeNotificationsDocument, baseOptions);
      }
export function useGetAnimeNotificationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAnimeNotificationsQuery, GetAnimeNotificationsQueryVariables>) {
          return Apollo.useLazyQuery<GetAnimeNotificationsQuery, GetAnimeNotificationsQueryVariables>(GetAnimeNotificationsDocument, baseOptions);
        }
export type GetAnimeNotificationsQueryHookResult = ReturnType<typeof useGetAnimeNotificationsQuery>;
export type GetAnimeNotificationsLazyQueryHookResult = ReturnType<typeof useGetAnimeNotificationsLazyQuery>;
export type GetAnimeNotificationsQueryResult = Apollo.QueryResult<GetAnimeNotificationsQuery, GetAnimeNotificationsQueryVariables>;
export function refetchGetAnimeNotificationsQuery(variables?: GetAnimeNotificationsQueryVariables) {
      return { query: GetAnimeNotificationsDocument, variables: variables }
    }
export const GetTrendingAnimeDocument = gql`
    query GetTrendingAnime($page: Int = 1, $perPage: Int = 20) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
      total
    }
    media(format: TV, isAdult: false, type: ANIME, sort: [TRENDING_DESC]) {
      ...AnimeFragment
    }
  }
}
    ${AnimeFragmentFragmentDoc}`;

/**
 * __useGetTrendingAnimeQuery__
 *
 * To run a query within a React component, call `useGetTrendingAnimeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTrendingAnimeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTrendingAnimeQuery({
 *   variables: {
 *      page: // value for 'page'
 *      perPage: // value for 'perPage'
 *   },
 * });
 */
export function useGetTrendingAnimeQuery(baseOptions?: Apollo.QueryHookOptions<GetTrendingAnimeQuery, GetTrendingAnimeQueryVariables>) {
        return Apollo.useQuery<GetTrendingAnimeQuery, GetTrendingAnimeQueryVariables>(GetTrendingAnimeDocument, baseOptions);
      }
export function useGetTrendingAnimeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTrendingAnimeQuery, GetTrendingAnimeQueryVariables>) {
          return Apollo.useLazyQuery<GetTrendingAnimeQuery, GetTrendingAnimeQueryVariables>(GetTrendingAnimeDocument, baseOptions);
        }
export type GetTrendingAnimeQueryHookResult = ReturnType<typeof useGetTrendingAnimeQuery>;
export type GetTrendingAnimeLazyQueryHookResult = ReturnType<typeof useGetTrendingAnimeLazyQuery>;
export type GetTrendingAnimeQueryResult = Apollo.QueryResult<GetTrendingAnimeQuery, GetTrendingAnimeQueryVariables>;
export function refetchGetTrendingAnimeQuery(variables?: GetTrendingAnimeQueryVariables) {
      return { query: GetTrendingAnimeDocument, variables: variables }
    }
export const SearchAnimeDocument = gql`
    query SearchAnime($search: String) {
  Page {
    pageInfo {
      hasNextPage
      total
    }
    media(search: $search, format_not_in: [MANGA, MUSIC, NOVEL, ONE_SHOT], isAdult: false, type: ANIME) {
      ...AnimeFragment
    }
  }
}
    ${AnimeFragmentFragmentDoc}`;

/**
 * __useSearchAnimeQuery__
 *
 * To run a query within a React component, call `useSearchAnimeQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchAnimeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchAnimeQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useSearchAnimeQuery(baseOptions?: Apollo.QueryHookOptions<SearchAnimeQuery, SearchAnimeQueryVariables>) {
        return Apollo.useQuery<SearchAnimeQuery, SearchAnimeQueryVariables>(SearchAnimeDocument, baseOptions);
      }
export function useSearchAnimeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchAnimeQuery, SearchAnimeQueryVariables>) {
          return Apollo.useLazyQuery<SearchAnimeQuery, SearchAnimeQueryVariables>(SearchAnimeDocument, baseOptions);
        }
export type SearchAnimeQueryHookResult = ReturnType<typeof useSearchAnimeQuery>;
export type SearchAnimeLazyQueryHookResult = ReturnType<typeof useSearchAnimeLazyQuery>;
export type SearchAnimeQueryResult = Apollo.QueryResult<SearchAnimeQuery, SearchAnimeQueryVariables>;
export function refetchSearchAnimeQuery(variables?: SearchAnimeQueryVariables) {
      return { query: SearchAnimeDocument, variables: variables }
    }
export const GetCharacterDocument = gql`
    query GetCharacter($id: Int) {
  Character(id: $id) {
    ...CharacterData
  }
}
    ${CharacterDataFragmentDoc}`;

/**
 * __useGetCharacterQuery__
 *
 * To run a query within a React component, call `useGetCharacterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCharacterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCharacterQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCharacterQuery(baseOptions?: Apollo.QueryHookOptions<GetCharacterQuery, GetCharacterQueryVariables>) {
        return Apollo.useQuery<GetCharacterQuery, GetCharacterQueryVariables>(GetCharacterDocument, baseOptions);
      }
export function useGetCharacterLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCharacterQuery, GetCharacterQueryVariables>) {
          return Apollo.useLazyQuery<GetCharacterQuery, GetCharacterQueryVariables>(GetCharacterDocument, baseOptions);
        }
export type GetCharacterQueryHookResult = ReturnType<typeof useGetCharacterQuery>;
export type GetCharacterLazyQueryHookResult = ReturnType<typeof useGetCharacterLazyQuery>;
export type GetCharacterQueryResult = Apollo.QueryResult<GetCharacterQuery, GetCharacterQueryVariables>;
export function refetchGetCharacterQuery(variables?: GetCharacterQueryVariables) {
      return { query: GetCharacterDocument, variables: variables }
    }
export const GetViewerDocument = gql`
    query GetViewer {
  Viewer {
    id
    name
    avatar {
      large
      medium
    }
    favourites {
      anime {
        nodes {
          id
          title {
            english
            romaji
            native
          }
          coverImage {
            large
            medium
          }
        }
      }
      characters {
        nodes {
          id
          name {
            full
          }
          image {
            large
            medium
          }
        }
      }
    }
    statistics {
      anime {
        count
        minutesWatched
      }
      manga {
        count
        chaptersRead
      }
    }
  }
}
    `;

/**
 * __useGetViewerQuery__
 *
 * To run a query within a React component, call `useGetViewerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetViewerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetViewerQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetViewerQuery(baseOptions?: Apollo.QueryHookOptions<GetViewerQuery, GetViewerQueryVariables>) {
        return Apollo.useQuery<GetViewerQuery, GetViewerQueryVariables>(GetViewerDocument, baseOptions);
      }
export function useGetViewerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewerQuery, GetViewerQueryVariables>) {
          return Apollo.useLazyQuery<GetViewerQuery, GetViewerQueryVariables>(GetViewerDocument, baseOptions);
        }
export type GetViewerQueryHookResult = ReturnType<typeof useGetViewerQuery>;
export type GetViewerLazyQueryHookResult = ReturnType<typeof useGetViewerLazyQuery>;
export type GetViewerQueryResult = Apollo.QueryResult<GetViewerQuery, GetViewerQueryVariables>;
export function refetchGetViewerQuery(variables?: GetViewerQueryVariables) {
      return { query: GetViewerDocument, variables: variables }
    }

      export interface IntrospectionResultData {
        __schema: {
          types: {
            kind: string;
            name: string;
            possibleTypes: {
              name: string;
            }[];
          }[];
        };
      }
      const result: IntrospectionResultData = {
  "__schema": {
    "types": [
      {
        "kind": "UNION",
        "name": "ActivityUnion",
        "possibleTypes": [
          {
            "name": "ListActivity"
          },
          {
            "name": "MessageActivity"
          },
          {
            "name": "TextActivity"
          }
        ]
      },
      {
        "kind": "UNION",
        "name": "LikeableUnion",
        "possibleTypes": [
          {
            "name": "ActivityReply"
          },
          {
            "name": "ListActivity"
          },
          {
            "name": "MessageActivity"
          },
          {
            "name": "TextActivity"
          },
          {
            "name": "Thread"
          },
          {
            "name": "ThreadComment"
          }
        ]
      },
      {
        "kind": "UNION",
        "name": "NotificationUnion",
        "possibleTypes": [
          {
            "name": "ActivityLikeNotification"
          },
          {
            "name": "ActivityMentionNotification"
          },
          {
            "name": "ActivityMessageNotification"
          },
          {
            "name": "ActivityReplyLikeNotification"
          },
          {
            "name": "ActivityReplyNotification"
          },
          {
            "name": "ActivityReplySubscribedNotification"
          },
          {
            "name": "AiringNotification"
          },
          {
            "name": "FollowingNotification"
          },
          {
            "name": "MediaDataChangeNotification"
          },
          {
            "name": "MediaDeletionNotification"
          },
          {
            "name": "MediaMergeNotification"
          },
          {
            "name": "RelatedMediaAdditionNotification"
          },
          {
            "name": "ThreadCommentLikeNotification"
          },
          {
            "name": "ThreadCommentMentionNotification"
          },
          {
            "name": "ThreadCommentReplyNotification"
          },
          {
            "name": "ThreadCommentSubscribedNotification"
          },
          {
            "name": "ThreadLikeNotification"
          }
        ]
      }
    ]
  }
};
      export default result;
    