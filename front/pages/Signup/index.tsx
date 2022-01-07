import useInput from '@hooks/useInput';
import React, { FormEvent, useCallback, useState } from 'react';
import { Button, Error, Form, Header, Input, Label, LinkContainer } from './styles';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail, onChangeEmail] = useInput('');
  const [nickname, setNickName, onChangeNickName] = useInput('');
  const [password, setPassword, ] = useInput('');
  const [passwordCheck, setPasswordCheck, ] = useInput('');
  const [mismatchError, setMisMatchError] = React.useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const onChangePassword = useCallback(
    e => {
      setPassword(e.target.value);
      setMisMatchError(e.target.value !== passwordCheck);
    },
    [passwordCheck, setPassword]
  );

  const onChangePasswordCheck = useCallback(
    e => {
      setPasswordCheck(e.target.value);
      setMisMatchError(e.target.value !== password);
    },
    [passwordCheck, setPasswordCheck]
  );
  
  const onSubmit = useCallback(
    e => {
      e.preventDefault();
      if (!nickname || !nickname.trim()) {
        return;
      }
      if (!mismatchError) {
        setSignUpError('');
        setSignUpSuccess(false);
        axios.post('/api/users', {
          email,
          nickname,
          password,
        },{
          withCredentials: true,
        },)
        .then((res) => {
          console.log(res);
          setSignUpSuccess(true);
        })
        .catch((e) => {
          console.log(e.response?.data);
          setSignUpError(e.response?.data);
        });
      }
    },
    [email, nickname, password, mismatchError]
  );

  return (
    <div id="container">
      <Header>SLACK-CLONE</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>email</span>
          <div>
            <Input type="email" id='email' value={email} onChange={onChangeEmail}/>
          </div>
        </Label>
        <Label id='nickname-label'>
          <span>nickname</span>
          <div>
            <Input type={'text'} id='nickname' name='nickname' value={nickname} onChange={onChangeNickName}/>
          </div>
        </Label>
        <Label id='password-label'>
          <span>password</span>
          <div>
            <Input type={'password'} id='password' name='password' value={password} onChange={onChangePassword}/>
          </div>
        </Label>
        <Label id='password-check-label'>
          <span>password-check</span>
          <div>
            <Input type={'password'} id='password-check' name='password-check' value={passwordCheck} onChange={onChangePasswordCheck}/>
          </div>
          {mismatchError && <Error>not matched password</Error>}
          {!nickname && <Error>put your nickname</Error>}
          {signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && <Error>signup success, login plz</Error>}
        </Label>
        <Button type='submit'>Sign up</Button>
      </Form>
      <LinkContainer>
        Did you have your account?&nbsp;
        <Link to="/login">go to login</Link>
      </LinkContainer>
    </div>
  );
}

export default Signup;