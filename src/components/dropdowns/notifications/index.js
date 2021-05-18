import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import NavDropdown from "react-bootstrap/NavDropdown";
import NotificationIcon from "images/icons/notification.png";
import { listNotifications, partialUpdateNotifications  } from "features/notifications/thunks";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from 'react-toast-notifications';
import { getProjectUrl } from "../../../utils/projects";
import { useNavigate } from "@reach/router";

const StyledNavDropdown = styled(NavDropdown)`
    .dropdown-toggle::before{
    content: '${(props) => props.totalnots}';
    display: inline-block;
    width: 18px;
    height: 18px;
    font-size: 12px;
    text-align: center;
    -webkit-border-radius: 7.5px;
    border-radius: 7.5px;
    background-color: ${props => props.theme.blue};
    position: absolute;
    top: 5px;
    right: 5px;
    color: white;
  }
  a::after {
      content: none;
  }

  .dropdown-menu {
    max-height: 250px;
    overflow-y: auto;
    padding: 20px 10px;
    width: 400px;
    &::-webkit-scrollbar {
      width: 0.5em;
      height: 0.5em;
     }
     &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
      background-color: white;
     }  
     &::-webkit-scrollbar-thumb {
      background-color: ${props => props.theme.gray100};
      border-radius: 3px;
   
      &:hover {
       background: ${props => props.theme.gray300};
      }
     }

  }
`;

const StyledLink = styled.a`
  margin: 0 10px;
  color: ${(props) => props.theme.dark};
`;

const StyledDropDownItem = styled(NavDropdown.Item)`
  display: flex;
  background-color: white;
  margin-bottom: 2px;
  margin-top: 2px;
  padding: 15px 30px 15px 15px;
  border-radius: 5px;
  position: relative;
  white-space: normal;
  font-size: 14px;
  align-items: center;
  &::before {
    ${props => !props.seen ? "content: '';" : ''};
    display: inline-block;
    width: 12px;
    height: 12px;
    font-size: 12px;
    text-align: center;
    -webkit-border-radius: 7.5px;
    border-radius: 50%;
    transform: translateY(-50%);
    background-color: ${props => props.theme.blue};
    position: absolute;
    top: 50%;
    right: 10px;
    color: white;
  }
  &:hover,
  &:active,
  &:focus {
    background-color: ${props => props.theme.gray200} !important;
    color: black !important;
  }
  &.active {
    color: black;
  }
`;

const StyledNotIcon = styled.img`
  @media (max-width: ${(props) => props.theme.smBreakpoint}) {
    width: auto;
  }
  padding: 10px;
  background-color: ${(props) => props.theme.gray300};
  border-radius: ${(props) => props.theme.borderRadius};

`;

const NotificationHeader = styled.h3`
  font-size : 22px
  font-weight : 700;
  margin-bottom : 20px;
  margin-left: 15px;
`;

const NotTimeStamp = styled.div`
  font-size: 10px;
  font-weight: 700;
`;

const ImageWrapper = styled.div`
  width : 50px;
  border-radius: 50%;
  margin-right: 10px;
  img {
    width: 100%;
    border-radius: 50%;
    box-shadow: 2px 2px 1px ${props => props.theme.gray300};
  }
`;

function NotificationsDropdown() {
  // Provides the a dropdown for the list of notifcations related to the logged in user.

  const  notifcationsState    = useSelector((state) => state.notifications);
  const projectState = useSelector((state) => state.projects);
  const { isLoading, entities} = notifcationsState;
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const triggerFetchNotifications = async () => {
    try {
      const action = await dispatch(listNotifications({"params": {}}));
      if (action.type === "LIST_NOTIFICATIONS/rejected") {
        addToast("Error occured while fetching notifications", {appearance: 'error', autoDismiss: true});
      }
    } catch(err) {
      addToast("Error occured while fetching notifications", {appearance: 'error', autoDismiss: true});
    }
  }

  const renderNotificationContent = (notification) =>{
    const actor = notification.action.actor ? notification.action.actor.firstName : "";
    
    if (notification.action.verb === "made a comment") {
      return `${actor} ${notification.action.verb} on ${notification.action.target.bucket ? notification.action.target.bucket.title : notification.action.target.title}`;
    } else if (notification.action.verb === "mentioned") {
      return `${actor} has ${notification.action.verb} you`;
    } else {
      return ""
    }
  }

  const markNotificationAsSeen = async (notification) => {
    try {
      const action = await dispatch(partialUpdateNotifications({
        objectId: notification.id,
        data: {seen: true}
      }));
      if (action.type == "PATCH_NOTIFICATIONS/rejected"){
        addToast("Error occured while marking notification seen", {appearance: 'error', autoDismiss: true})
      }
    } catch (e) {
      addToast("Error occured while marking notification seen", {appearance: 'error', autoDismiss: true})
    }
  }

  const getUserIcon = (notification) => {
    const actor = notification.action.actor;
    if (actor) {
      return actor.image;
    }

    return "";
  }

  const redirectToNotificationUrl = (notification) => {
    if (notification.action.verb === "made a comment" ) {
        const url = `/feed?object_id=${notification.action.actionObject.objectId}&content_type=${notification.action.actionObject.contentType}`
        navigate(url);
    } else if (notification.action.verb === "mentioned") {
      const url = `/feed?object_id=${notification.action.target.objectId}&content_type=${notification.action.target.contentType}`
      navigate(url); 
    }
    // if (notification.action.verb === "made a comment") {
    //   if (projectState.entities.classes) {
    //     let project = projectState.entities.classes.find((item) => notification.action.target.id === item.id);
    //     project = project ? project : projectState.entities.recordings.find((item) => notification.action.target.id === item.id);
    //     if (project) {
    //       const url = getProjectUrl(project);
    //       navigate(url);
    //     }
    //   }
      
    return ""
  }

  useEffect(() => {
    triggerFetchNotifications();
    setInterval(triggerFetchNotifications, 30000);
  }, []);

  const notificationsCount = entities ? entities.results ? entities.results.filter(entity => !entity.seen).length : 0 : 0;

  return (
      <StyledNavDropdown totalnots={notificationsCount}
        title={<StyledNotIcon src={NotificationIcon} alt="Rad how to school notification" />}
        id="notifications-navbar-dropdown"
        alignRight
      >
        <>
          <NotificationHeader> Notifications </NotificationHeader>
          {isLoading ? "Loading" : entities.results && entities.results.length ? 
            entities.results.map(notification => {
              const notDate = new Date(notification.action.timestamp);
              let month = notDate.getMonth() + 1;
              let day = notDate.getDate();
              let hour = notDate.getHours();
              let min = notDate.getMinutes();
              let year = notDate.getFullYear();
          
              month = (month < 10 ? "0" : "") + month;
              day = (day < 10 ? "0" : "") + day;
              hour = (hour < 10 ? "0" : "") + hour;
              min = (min < 10 ? "0" : "") + min;
              const notDateFormated = `${day}/${month}/${year} ${hour}:${min} `
              
              return (
                <StyledDropDownItem
                seen={notification.seen ? "seen" : null}
                key={notification.id}
                onClick={() => {
                  markNotificationAsSeen(notification);
                  redirectToNotificationUrl(notification);
                }}
              >
                <ImageWrapper>
                  <img src={getUserIcon(notification)} />
                </ImageWrapper>
                <div>
                  <div> {renderNotificationContent(notification)} </div>
                  <NotTimeStamp> {notDateFormated} </NotTimeStamp>
                </div>
              </StyledDropDownItem>  
              )
              }
            )
            : 
            ""
          }
        </>
      </StyledNavDropdown>
    );
}

export default NotificationsDropdown;
