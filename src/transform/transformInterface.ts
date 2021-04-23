import {ApiInterface, ApiItem, ApiPropertySignature} from '@microsoft/api-extractor-model'
import {SanityDocumentValue} from '../sanity/types'
import {RELEASE_TAGS} from './constants'
import {createId, hash, sanitizeName, slugify} from './helpers'
import {transformDocComment} from './transformDocComment'
import {transformTokens} from './transformTokens'
import {TransformOpts} from './types'

export function transformInterface(
  config: TransformOpts,
  node: ApiInterface,
  releaseDoc: SanityDocumentValue
): SanityDocumentValue {
  const docComment = node.tsdocComment
  const name = sanitizeName(node.name)

  return {
    _type: 'api.interface',
    _id: createId(config, node.canonicalReference.toString()),
    release: {_type: 'reference', _ref: releaseDoc._id, _weak: true},
    name,
    slug: {_type: 'slug', current: slugify(name)},
    comment: docComment ? transformDocComment(docComment) : undefined,
    extends: node.extendsTypes.map((t, idx) => {
      return {
        _type: 'api.extend',
        _key: `extend${idx}`,
        type: transformTokens(
          config,
          t.excerpt.tokens.slice(t.excerpt.tokenRange.startIndex, t.excerpt.tokenRange.endIndex)
        ),
      }
    }),
    members: node.members.map((m) => transformInterfaceMember(config, m)),
    releaseTag: RELEASE_TAGS[node.releaseTag],
    typeParameters: node.typeParameters.map((p, idx: number) => {
      return {
        _type: 'api.typeParameter',
        _key: `typeParameter${idx}`,
        name: p.name,
        constraintType: transformTokens(
          config,
          node.excerptTokens.slice(
            p.constraintExcerpt.tokenRange.startIndex,
            p.constraintExcerpt.tokenRange.endIndex
          )
        ),
        defaultTypeType: transformTokens(
          config,
          node.excerptTokens.slice(
            p.defaultTypeExcerpt.tokenRange.startIndex,
            p.defaultTypeExcerpt.tokenRange.endIndex
          )
        ),
      }
    }),
  }
}

function transformInterfaceMember(config: TransformOpts, m: ApiItem) {
  if (m.kind === 'PropertySignature') {
    const mem = m as ApiPropertySignature
    const docComment = mem.tsdocComment

    return {
      _type: 'api.property',
      _key: hash(mem.name),
      type: transformTokens(
        config,
        mem.excerptTokens.slice(
          mem.propertyTypeExcerpt.tokenRange.startIndex,
          mem.propertyTypeExcerpt.tokenRange.endIndex
        )
      ),
      name: mem.name,
      comment: docComment ? transformDocComment(docComment) : undefined,
      optional: mem.isOptional,
      releaseTag: RELEASE_TAGS[mem.releaseTag],
    }
  }

  throw new Error(`unknown interface member kind: ${m.kind}`)
}
