import gql from 'graphql-tag'

import { getItem, setItem } from '../utils/local-storage'
import { validObject, deleteCookie } from '../utils/js-helpers'
import Log from '../utils/log'

import { client } from '../graphql/apollo'

//    logo: 'https://aadevelop.blob.core.windows.net/module-master/assets/logos/Superalgos-mark-auth0-lock.png',
//    primaryColor: '#e3493c'


const AUTHENTICATE = gql`
  mutation authenticate($idToken: String!) {
    users_Authenticate(idToken: $idToken) {
      alias
      authId
    }
  }
`

const VERIFY_TEAM_INVITE = gql`
  mutation verifyTeamInvite($token: String!) {
    verifyTeamInvite(token: $token) {
      email
      team {
        slug
      }
    }
  }
`

class Auth {
  constructor (cb, apolloClient) {
    this.handleAuthentication()
    // binds  functions to keep this context
    this.apolloClient = apolloClient
    this.cb = cb.bind(this)
    this.login = this.login.bind(this)
    this.loginInvite = this.loginInvite.bind(this)
    this.logout = this.logout.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.checkSession = this.checkSession.bind(this)
  }

  login () {
    // Call the show method to display the widget.
    Log.info('logging in')
    // TODO show login form
  }

  async loginInvite () {
    let email
    let team
    try {
      const data = await client.mutate({
        mutation: VERIFY_TEAM_INVITE,
        // TODO add CSR
        variables: { CSR: '' }
      })

      Log.info('auth.loginInvite')
      Log.info(await data.data.verifyTeamInvite)

      setItem('invite', JSON.stringify(data.data.verifyTeamInvite))

      email = data.data.verifyTeamInvite.email
      team = data.data.verifyTeamInvite.team.slug
    } catch (err) {
      return Log.error(err, 'loginInvite err: ')
    }
    inviteOptions.prefill.email = email
    inviteOptions.auth.params.state = `${email}|${team}`
    // TODO show invite form?
  }

  handleAuthentication () {
    // TODO generate or unlock X.509 client certificate
  }

  checkSession () {
    return new Promise((resolve, reject) => {
      // TODO check if X.509 client certificate is unlocked
    })
  }

  setSession (authResult) {
    if (authResult && authResult.accessToken && authResult.idToken) {
      // Set the time that the access token will expire at
      let expiresAt = JSON.stringify(
        authResult.expiresIn * 1000 + new Date().getTime()
      )
      setItem('access_token', authResult.accessToken)
      setItem('id_token', authResult.idToken)
      setItem('expires_at', expiresAt)
      const data = {
        status: `success`,
        accessToken: authResult.accessToken,
        idToken: authResult.idToken,
        expiresAt
      }
      Log.info('setSession idTokenPayload:')
      Log.info(authResult.idTokenPayload)

      this.signinOrCreateAccount({ ...data })
      this.cb(data)
      const user = {
        authId: authResult.idTokenPayload.sub,
        alias: authResult.idTokenPayload.nickname
      }
      setItem('user', JSON.stringify(user))
      return true
    }
  }

  async signinOrCreateAccount ({ accessToken, idToken, expiresAt }) {
    try {
      const response = await client.mutate({
        mutation: AUTHENTICATE,
        variables: { idToken }
      })
      Log.info('auth.signinOrCreateAccount data:')
      Log.info(response)
      const user = {
        authId: response.data.users_Authenticate.authId,
        alias: response.data.users_Authenticate.alias
      }
      setItem('user', JSON.stringify(user))
      window.location.href = '/'
      return response.data
    } catch (err) {
      return console.log('Sign in or create account error: ', err)
    }
  }

  logout () {
    // Clear access token and ID token from local storage
    window.localStorage.clear()
    // TODO forget X.509 password
  }

  async isAuthenticated () {
    // check session for unlocked X.509 cert
    const getUser = await getItem('authUser')
    const getExpires = await getItem('expires_at')
    let user = JSON.parse(getUser)

    if (new Date().getTime() < getExpires * 1000) {
      console.log(
        'handleAuth.user exp: ',
        user,
        getExpires,
        window.location.href
      )

      return user
    }

    if (/manage|profile|create|dashboard/.test(window.location.href) && !user) {
      this.login()
    }
    // TODO this probably shouldn't always return false...
    return false
  }
}

export default Auth
