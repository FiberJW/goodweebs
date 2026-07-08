import { graphql } from "yep/graphql/tada";

// Media-list-entry mutations. Grouped here rather than colocated because
// UpdateProgress is shared between the details screen and the list-item
// container; the rest are a cohesive family with it. Each is a TadaDocumentNode,
// so useDebouncedMutation/useMutation infer their variables + result.

export const UpdateProgress = graphql(`
  mutation UpdateProgress($id: Int, $progress: Int) {
    SaveMediaListEntry(id: $id, progress: $progress) {
      id
      progress
      status
      score(format: POINT_10)
    }
  }
`);

export const UpdateProgressVolumes = graphql(`
  mutation UpdateProgressVolumes($id: Int, $progressVolumes: Int) {
    SaveMediaListEntry(id: $id, progressVolumes: $progressVolumes) {
      id
      progress
      progressVolumes
      status
      score(format: POINT_10)
    }
  }
`);

export const UpdateScore = graphql(`
  mutation UpdateScore($id: Int, $score: Float) {
    SaveMediaListEntry(id: $id, score: $score) {
      id
      progress
      status
      score
    }
  }
`);

export const UpdateStatus = graphql(`
  mutation UpdateStatus($mediaId: Int, $status: MediaListStatus) {
    SaveMediaListEntry(mediaId: $mediaId, status: $status) {
      id
      progress
      status
      score(format: POINT_10)
      media {
        id
        mediaListEntry {
          id
          progress
          status
          score(format: POINT_10)
        }
      }
    }
  }
`);

export const RemoveFromList = graphql(`
  mutation RemoveFromList($id: Int!) {
    DeleteMediaListEntry(id: $id) {
      deleted
    }
  }
`);
