import React, { ReactNode, useState, useEffect } from 'react';
import { HsdsApi } from './api';
import Provider from '../Provider';

interface Props {
  username: string;
  password: string;
  filepath: string;
  children: ReactNode;
}

/* Provider of metadata and values by HSDS */
function HsdsProvider(props: Props): JSX.Element {
  const { username, password, filepath, children } = props;
  const [api, setApi] = useState<HsdsApi>();

  useEffect(() => {
    setApi(new HsdsApi(username, password, filepath));
  }, [filepath, password, username]);

  return <Provider api={api}>{children}</Provider>;
}

export default HsdsProvider;
