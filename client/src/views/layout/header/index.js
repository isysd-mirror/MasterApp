import React, { Component } from 'react'
import ReactModalLogin from "react-modal-login"
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import withWidth from '@material-ui/core/withWidth'

// components
import { LoggedIn } from './LoggedIn'

import allMenus from './imports'
import AALogo from '../../../assets/superalgos/Superalgos-logo-horz-dark.svg'

class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {
      onTop: true,
      mobileOpen: false,
      openedMenu: null,
      user: null,
      showModal: false,
      loading: false,
      error: null
    }
  }

  openModal() {
    this.setState({
      showModal: true
    });
  }

  onLogin() {
    console.log('__onLogin__');
    console.log('nickname: ' + document.querySelector('#login').value);
    console.log('password: ' + document.querySelector('#password').value);

    const nickname = document.querySelector('#login').value;
    const password = document.querySelector('#password').value;

    if (!nickname || !password) {
      this.setState({
        error: true
      })
    } else {
      this.onLoginSuccess('form');
    }
  }

  onRegister() {
    console.log('__onRegister__');
    console.log('login: ' + document.querySelector('#login').value);
    console.log('email: ' + document.querySelector('#email').value);
    console.log('password: ' + document.querySelector('#password').value);

    const login = document.querySelector('#login').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    if (!login || !email || !password) {
      this.setState({
        error: true
      })
    } else {
      this.onLoginSuccess('form');
    }
  }

  onLoginSuccess(method, response) {
    this.closeModal();
    this.setState({
      loggedIn: method,
      loading: false
    })
  }

  onLoginFail(method, response) {
    console.log("logging failed with " + method);
    this.setState({
      error: response
    });
  }

  closeModal() {
    this.setState({
      showModal: false,
      error: null
    });
  }

  startLoading() {
    this.setState({
      loading: true
    });
  }

  finishLoading() {
    this.setState({
      loading: false
    });
  }

  afterTabsChange() {
    this.setState({
      error: null
    });
  }

  handleScroll () {
    if (window.pageYOffset > 0) {
      this.setState({ onTop: false })
    } else {
      this.setState({ onTop: true })
    }
  }

  scrollToTop () {
    document.body.scrollTop = 0 // For Safari
    document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera
  }

  toggleMobileOpen () {
    this.setState({ mobileOpen: !this.state.mobileOpen })
  }

  toggleMenuOpen (index, allowed) {
    if (allowed) {
      if (this.state.openedMenu === index) {
        this.setState({ openedMenu: null })
      } else {
        this.setState({ openedMenu: index })
      }
    }
  }

  mouseLeave (allowed) {
    if (allowed) {
      this.setState({ openedMenu: null })
    }
  }

  closeAll () {
    this.setState({ openedMenu: null, mobileOpen: false })
  }

  componentDidMount () {
    window.addEventListener('scroll', () => this.handleScroll())
    const user = window.localStorage.getItem('user')
    this.setState({ user })
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', () => this.handleScroll())
  }

  render () {
    const bigScreen = (this.props.width === 'lg' || this.props.width === 'xl')
    let { auth } = this.props
    let { onTop, mobileOpen, openedMenu } = this.state
    if (window.localStorage.getItem('access_token')) {
      if (jwtDecode(window.localStorage.getItem('access_token')).exp < new Date().getTime() / 1000) {
        window.localStorage.clear()
        window.location.reload()
      }
    }
    let user = JSON.parse(this.state.user)

    const menus = allMenus.map(({ icon: Icon, to, title, submenus, authenticated }, index) => {
      if (authenticated && !(this.state.user !== undefined && this.state.user !== null)) {
        return
      }
      return (
        <li
          onMouseEnter={() => this.toggleMenuOpen(index, bigScreen)}
          onMouseLeave={() => this.mouseLeave(bigScreen)}
          key={index}
          className={openedMenu === index ? 'primaryLink hasChildren selected' : 'primaryLink hasChildren'}
        >
          { bigScreen
            ? <Link to={to} onClick={() => this.toggleMenuOpen(index, true)}> {title} </Link>
            : <a onClick={() => this.toggleMenuOpen(index, true)}> {title} </a>
          }
          <ul className='subMenu'>
            { bigScreen
              ? ''
              : <li key={index + 'home'}><Link to={to}> <Icon /> Module Home Page </Link></li>
            }
            {
              submenus.map(({ icon: SubIcon, to: subTo, title: subTitle, externalLink, authenticated: subAuthenticated }, subindex) => {
                if (subAuthenticated && !(this.state.user !== undefined && this.state.user !== null)) {
                  return
                }
                if (externalLink) {
                  return (
                    <li key={subindex}><a href={subTo} target='_blank'> <SubIcon /> {subTitle} </a></li>
                  )
                }
                return (
                  <li key={subindex}><Link to={subTo} onClick={() => this.closeAll(index)}> <SubIcon /> {subTitle} </Link></li>
                )
              })}
          </ul>
        </li>
      )
    })

    return (
      <React.Fragment>
        <header className={onTop ? 'menu' : 'menu notOnTop'}>
          <div className='container'>
            <Link to='/'> <img className='logo' src={AALogo} alt='Superalgos' /> </Link>
            <div className={mobileOpen ? 'mobileHandle openedMobile' : 'mobileHandle'} onClick={() => this.toggleMobileOpen()}>
              Menu
            </div>
            <nav className={mobileOpen ? 'links openedMobile' : 'links'}>
              <ul className='primaryMenu'>
                <li className='primaryLink'>
                  <Link to='/charts'> Charts </Link>
                </li>
                {menus}
                <li className='primaryLink'>
                  <a href='https://www.superalgos.org/documentation-quick-start.shtml'> Docs </a>
                </li>
                {this.state.user !== undefined && this.state.user !== null ? (
                  <LoggedIn
                    user={user}
                    auth={auth}
                    bigScreen={bigScreen}
                    openedMenu={openedMenu}
                    toggleMenuOpen={(keyValue, allowedValue) => this.toggleMenuOpen(keyValue, allowedValue)}
                    mouseLeave={(allowedValue) => this.mouseLeave(allowedValue)}
                    closeAll={() => this.closeAll()}
                  />
                ) : (

                  <li className='primaryLink'>
                    <a href='#' onClick={() => this.openModal()}> Login / Sign Up </a>
                    <ReactModalLogin
                      visible={this.state.showModal}
                      onCloseModal={this.closeModal.bind(this)}
                      loading={this.state.loading}
                      error={this.state.error}
                      tabs={{
                        afterChange: this.afterTabsChange.bind(this)
                      }}
                      loginError={{
                        label: "Couldn't log in, please try again."
                      }}
                      registerError={{
                        label: "Couldn't sign up, please try again."
                      }}
                      startLoading={this.startLoading.bind(this)}
                      finishLoading={this.finishLoading.bind(this)}
                      form={{
                        onLogin: this.onLogin.bind(this),
                        onRegister: this.onRegister.bind(this),
                        loginBtn: {
                          label: "Sign in"
                        },
                        registerBtn: {
                          label: "Sign up"
                        },
                        loginInputs: [
                          {
                            containerClass: 'RML-form-group',
                            label: 'Nickname',
                            type: 'text',
                            inputClass: 'RML-form-control',
                            id: 'login',
                            name: 'login',
                            placeholder: 'Nickname',
                          },
                          {
                            containerClass: 'RML-form-group',
                            label: 'Password',
                            type: 'password',
                            inputClass: 'RML-form-control',
                            id: 'password',
                            name: 'password',
                            placeholder: 'Password',
                          }
                        ],
                        registerInputs: [
                          {
                            containerClass: 'RML-form-group',
                            label: 'Nickname',
                            type: 'text',
                            inputClass: 'RML-form-control',
                            id: 'login',
                            name: 'login',
                            placeholder: 'Nickname',
                          },
                          {
                            containerClass: 'RML-form-group',
                            label: 'Email',
                            type: 'email',
                            inputClass: 'RML-form-control',
                            id: 'email',
                            name: 'email',
                            placeholder: 'Email',
                          },
                          {
                            containerClass: 'RML-form-group',
                            label: 'Password',
                            type: 'password',
                            inputClass: 'RML-form-control',
                            id: 'password',
                            name: 'password',
                            placeholder: 'Password',
                          }
                        ],
                      }}
                    />
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </header>
        {onTop ? '' : <div className='toTop' onClick={() => { this.scrollToTop() }} />}
      </React.Fragment>
    )
  }
}

Header.propTypes = {
  auth: PropTypes.object.isRequired
}

export default withWidth()(Header)
