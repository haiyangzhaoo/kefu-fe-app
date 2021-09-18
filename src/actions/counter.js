import {
  ADD,
  MINUS,
  SET_USER,
  CODE,
  SET_DATA
} from '../constants/counter'

export const add = () => {
  return {
    type: ADD
  }
}
export const minus = () => {
  return {
    type: MINUS
  }
}

// 异步的action
export function asyncAdd () {
  return dispatch => {
    setTimeout(() => {
      dispatch(add())
    }, 2000)
  }
}

export const setUser = (info) => {
  return {
    type:SET_USER,
    info
  }
}

export const setCode = (code) => {
  return {
    type:CODE,
    code
  }
}

export const setData = data => {
  return {
    type: SET_DATA,
    data: data
  }
}
