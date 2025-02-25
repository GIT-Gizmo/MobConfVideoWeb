//
// RequestDetailDialog.tsx
//
// Copyright (c) 2019-2022 Hironori Ichimiya <hiron@hironytic.com>
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

import { Button, CircularProgress, Dialog, DialogContent, Grid, Menu, MenuItem, Typography } from "@mui/material"
import { Note, OndemandVideo, VerifiedUser } from "@mui/icons-material"
import { IRDETypes } from "../../utils/IRDE"
import { RequestDetail } from "./RequestDetailLogic"
import { useNavigate, useParams } from "react-router-dom"
import { WatchedEvents } from "../session_detail/WatchedEvents"
import { Description } from "../session_detail/Description"
import { Speakers } from "../session_detail/Speakers"
import { useContext, useEffect, useState, MouseEvent } from "react"
import { RequestDetailContext } from "./RequestDetailContext"
import { useObservableState } from "observable-hooks"
import { createTweetUrl, TweetButton } from "../../utils/TweetButton"

export function RequestDetailDialog(): JSX.Element {
  const navigate = useNavigate()
  const params = useParams()
  const logic = useContext(RequestDetailContext)

  useEffect(() => {
    const eventId = params["eventId"]
    const requestId = params["requestId"]
    if (eventId !== undefined && requestId !== undefined) {
      logic.setCurrentRequest(eventId, requestId)
    }
  }, [params, logic])
  
  function onClose() {
    navigate("..", { replace: true })
  }
  
  return (
    <Dialog
      open={true}
      onClose={onClose}
      fullWidth={true}
      maxWidth="xl"
    >
      <DialogContent>
        <RequestDetailBody/>
      </DialogContent>
    </Dialog>
  )
}

function RequestDetailBody(): JSX.Element {
  const logic = useContext(RequestDetailContext)
  const irde = useObservableState(logic.requestDetail$, { type: IRDETypes.Initial })

  switch (irde.type) {
    case IRDETypes.Initial:
      return <RequestDetailInitialBody/>
    case IRDETypes.Running:
      return <RequestDetailRunningBody/>
    case IRDETypes.Done:
      return <RequestDetailDoneBody requestDetail={irde.requestDetail} />
    case IRDETypes.Error:
      return <RequestDetailErrorBody message={irde.message}/>
  }
}

function RequestDetailInitialBody(): JSX.Element {
  return <></>
}

function RequestDetailRunningBody(): JSX.Element {
  return (
    <div style={{ textAlign: "center" }}>
      <CircularProgress/>
    </div>
  )
}

interface RequestDetailDoneBodyProps {
  requestDetail: RequestDetail
}
function RequestDetailDoneBody({ requestDetail }: RequestDetailDoneBodyProps): JSX.Element {
  const logic = useContext(RequestDetailContext)
  const isWatched = useObservableState(logic.isWatched$, undefined)
  const isAdmin = useObservableState(logic.isAdmin$, false)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  function handleShowAdminMenu(event: MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget)
  }
  function handleCloseAdminMenu() {
    setAnchorEl(null)
  }
  function handleMakeItWatched() {
    logic.makeItWatched()
    handleCloseAdminMenu()
  }
  function handleMakeItUnwatched() {
    logic.makeItUnwatched()
    handleCloseAdminMenu()
  }
  function handleAnnounceTweet1() {
    const announceTweetUrl1 = createTweetUrl({
      text: `${requestDetail.conference}から「${requestDetail.title}」`,
      url: requestDetail.videoUrl,
      hashtags: ["mobconfvideo"],
    })
    window.open(announceTweetUrl1, "_blank", "noopener,noreferrer")
  }
  function handleAnnounceTweet2() {
    if (requestDetail.slideUrl !== undefined) {
      const announceTweetUrl2 = createTweetUrl({
        text: "この動画のスライドはこちらです。",
        url: requestDetail.slideUrl,
        hashtags: ["mobconfvideo"],
      })
      window.open(announceTweetUrl2, "_blank", "noopener,noreferrer")
    }
  }
  
  return (
    <Grid container={true} spacing={2} justifyContent="space-between">
      <Grid item={true} xs={12}>
        <Grid container={true} spacing={2} justifyContent="space-between">
          <Grid item={true}>
            <Typography variant="body2" color="textSecondary">
              {requestDetail.conference}
            </Typography>
          </Grid>
          <Grid item={true} style={{textAlign: "end"}}>
            {(requestDetail.minutes) && (
              <Typography variant="body2" color="textSecondary">
                {requestDetail.minutes}分
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
      {(requestDetail.watchedEvents !== undefined && requestDetail.watchedEvents.length > 0) && (
        <Grid item={true} xs={12}>
          <WatchedEvents events={requestDetail.watchedEvents}/>
        </Grid>
      )}
      <Grid item={true} xs={12}>
        <Typography variant="h5" color="textPrimary">
          {requestDetail.title}
        </Typography>
      </Grid>
      {(requestDetail.description !== undefined) && (
        <Grid item={true} xs={12}>
          <Description description={requestDetail.description}/>
        </Grid>
      )}
      <Grid item={true} xs={12}>
        <Grid container={true} spacing={0} alignItems="flex-end" justifyContent="space-between">
          {(requestDetail.speakers !== undefined) && ( 
            <Grid item={true}>
              <Speakers speakers={requestDetail.speakers}/>
            </Grid>
          )}
          <Grid item={true} style={{flexGrow: 1}}>
            <Grid container={true} spacing={0} alignItems="center" justifyContent="flex-end">
              <Grid item={true}>
                {isAdmin && (
                  <>
                    <Button onClick={handleShowAdminMenu}>
                      <VerifiedUser/> 運営メニュー
                    </Button>
                    <Menu open={anchorEl !== null} anchorEl={anchorEl} onClose={handleCloseAdminMenu}>
                      <MenuItem onClick={() => void handleAnnounceTweet1()}>開始ツイート1</MenuItem>
                      {requestDetail.slideUrl !== undefined && (
                        <MenuItem onClick={() => void handleAnnounceTweet2()}>開始ツイート2</MenuItem>
                      )}
                      {isWatched !== true && (
                        <MenuItem onClick={() => void handleMakeItWatched()}>鑑賞済みにする</MenuItem>
                      )}
                      {isWatched !== false && (
                        <MenuItem onClick={() => void handleMakeItUnwatched()}>未鑑賞に戻す</MenuItem>
                      )}
                    </Menu>
                  </>
                )}
              </Grid>
              <Grid item={true}>
                {requestDetail.videoUrl !== undefined && (
                  <TweetButton text={`鑑賞中！\n\n${requestDetail.title}`} url={requestDetail.videoUrl} hashtags={["mobconfvideo"]}/>
                )}
              </Grid>
              <Grid item={true}>
                {requestDetail.slideUrl !== undefined && (
                  <Button href={requestDetail.slideUrl} target="_blank" rel="noopener noreferrer" color="primary">
                    <Note /> スライド
                  </Button>
                )}
              </Grid>
              <Grid item={true}>
                {requestDetail.videoUrl !== undefined && (
                  <Button href={requestDetail.videoUrl} target="_blank" rel="noopener noreferrer" color="primary">
                    <OndemandVideo/> ビデオ
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

interface RequestDetailErrorBodyProps {
  message: string
}
function RequestDetailErrorBody({ message }: RequestDetailErrorBodyProps): JSX.Element {
  return (
    <div style={{ textAlign: "center" }}>
      <Typography variant="body2" color="error">
        エラーが発生しました
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {message}
      </Typography>
    </div>
  )
}
