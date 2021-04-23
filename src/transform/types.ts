import {SanityDocumentValue} from '../sanity/types'

export interface TransformOpts {
  package: {
    scope: string | null
    name: string
    version: string
  }
  currPackageDoc?: SanityDocumentValue | null
}
