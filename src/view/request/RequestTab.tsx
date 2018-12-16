//
// RequestTab.tsx
//
// Copyright (c) 2018 Hironori Ichimiya <hiron@hironytic.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

import { Card, CardActionArea, CircularProgress, Theme, Typography, withTheme } from '@material-ui/core';
import React, { Key } from 'react';
import Snapshot from 'src/common/Snapshot';
import Request from 'src/model/Request';
import { IRequestList, IRequestListError, IRequestListLoaded, RequestListState } from './RequestBloc';
import RequestContext from './RequestContext';

interface IProps {
  key?: Key,
  theme: Theme,
}

class RequestTab extends React.Component<IProps> {
  public render() {
    return (
      <RequestContext.Consumer>
        {(bloc) => (
          <Snapshot source={bloc.requestList} initialValue={{state: RequestListState.NotLoaded}}>
            {(requestList: IRequestList) => this.renderBody(requestList)}
          </Snapshot>
        )}
      </RequestContext.Consumer>
    );
  }

  private renderBody(requestList: IRequestList) {
    switch (requestList.state) {
      case RequestListState.NotLoaded:
        return (<React.Fragment/>);

      case RequestListState.Loading:
        return this.renderLoadingBody();
      
      case RequestListState.Loaded:
        return this.renderLoadedBody(requestList.loaded!);
      
      case RequestListState.Error:
        return this.renderErrorBody(requestList.error!);      
    }
  }

  private renderLoadingBody() {
    return (
      <div>
        <CircularProgress style={{margin: this.props.theme.spacing.unit * 2}}/>
      </div>
    );
  }

  private renderLoadedBody(loaded: IRequestListLoaded) {
    return (
      <div style={{
        marginTop: 20,
        padding: 8
      }}>
        {loaded.requests.map((request) => this.renderRequestItem(request))}
      </div>
    )
  }

  private renderRequestItem(request: Request) {
    return (
      <Card key={request.id} style={{
        marginBottom: 10,
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: 600,
        textAlign: "start",
      }}>
        <CardActionArea style={{padding: 20}}>
          <Typography variant="body1" color="textSecondary">
            {request.conference}
          </Typography>
          <Typography variant="subheading" color="textPrimary">
            {request.title}
          </Typography>
        </CardActionArea>
      </Card>
    )
  }

  private renderErrorBody(error: IRequestListError) {
    return (<div />);
  }
}

export default withTheme()(RequestTab);
