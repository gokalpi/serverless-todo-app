import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { Jwk } from '../../auth/Jwk'
import { certToPEM } from '../../auth/utils'

const jwksUrl = 'https://dev-lsutvgwy.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  console.log('Authorizing a user', event.authorizationToken)

  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  if (!authHeader) throw new Error('No authentication header')

  console.log('Verifying token', authHeader)

  const token = getToken(authHeader)

  console.log('Token received', token)

  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  console.log('Jwt decoded', jwt)

  const key = await getKey(jwt.header.kid, jwt.header.alg)

  console.log('Key:', key)

  const secret = certToPEM(key)

  console.log('Secret', secret)
  
  return verify(token, secret, { algorithms: ['RS256'] }) as JwtPayload
}

async function getKey(kid: string, alg: string) {
  console.log(`Getting key id ${kid} with ${alg} algorithm'`)

  const response = await Axios.get(jwksUrl)
  const keys: Jwk[] = response.data.keys

  console.log('Keys', keys)

  const key = keys.find(key => key.kid === kid && key.alg === alg)
  if (!key) throw new Error('Key not found')

  return key.x5c[0]
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  console.log('Getting token', authHeader)

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}