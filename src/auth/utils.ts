import { decode } from 'jsonwebtoken'
import { APIGatewayProxyEvent } from 'aws-lambda'

import { JwtPayload } from './JwtPayload'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  if (!jwtToken) new Error('No token found')

  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

/**
 * Parse an event authorization header and return a user id
 * @param event Event to parse
 * @returns a user id from the event
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  if (!authorization) new Error('No authorization found')

  return parseUserId(getTokenFromAuthorization(authorization))
}

/**
 * Check a certificate and return a public key
 * @param cert Certificate to check
 * @returns a public key from the certificate
 */
export function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}

export function getTokenFromAuthorization(authorization: string) {
  if (!authorization) throw new Error('Not authorized')

  const split = authorization.split(' ')
  const jwtToken = split[1]

  return jwtToken
}