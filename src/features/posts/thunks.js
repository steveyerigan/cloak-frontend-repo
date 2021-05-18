import { createAsyncThunk } from "@reduxjs/toolkit";
import { 
  UPDATE_POST,
  FETCH_POSTS,
  DELETE_POST,
  FETCH_POST_DETAILS,
  FETCH_POST_DETAILS_WITH_CONTENT_TYPE,
  ADD_LIKE
} from "./constants";
import PostService from "./service";

export const fetchPosts = createAsyncThunk(
  FETCH_POSTS,
  async ({ fresh, nextUrl }) => {
    // Fetch next tells us if we're fetching the next page, or if we're fetching fresh.
    const service = new PostService();
    const response =
      nextUrl && !fresh
        ? await service.getNextUrl(nextUrl)
        : await service.list();
    return response.data;
  }
);

export const fetchPostDetails = createAsyncThunk(
  FETCH_POST_DETAILS,
  async ({ postId }, { rejectWithValue }) => {
    // Fetch next tells us if we're fetching the next page, or if we're fetching fresh.
    const service = new PostService();
    try {
      const response = await service.fetch(postId);
      return response.data;
    } catch (err) {
      const { status, data } = err.response;
      return rejectWithValue({ status, data });
    }
  }
);


export const fetchPostDetailsWithContentType = createAsyncThunk(
  FETCH_POST_DETAILS_WITH_CONTENT_TYPE,
  async ({ objectId, contentType }, { rejectWithValue }) => {
    // Fetch next tells us if we're fetching the next page, or if we're fetching fresh.
    const service = new PostService();
    try {
      const response = await service.fetchPostWIthContentType(objectId, contentType);
      return response.data;
    } catch (err) {
      const { status, data } = err.response;
      return rejectWithValue({ status, data });
    }
  }
);


export const updatePost = createAsyncThunk(
  UPDATE_POST,
  async ({ postId, payload }, { rejectWithValue }) => {
    const service = new PostService();
    try {
      const response = await service.update(postId, payload);
      return response.data;
    } catch (err) {
      const { status, data } = err.response;
      return rejectWithValue({ status, data });
    }
  }
);

export const deletePost = createAsyncThunk(
  DELETE_POST,
  async ({ postId }, { rejectWithValue }) => {
    const service = new PostService(postId);
    try {
      const response = await service.delete(postId);
      return response.data;
    } catch (err) {
      const { status, data } = err.response;
      return rejectWithValue({ status, data });
    }
  }
);

export const addLike = createAsyncThunk(
  ADD_LIKE,
  async ({ postId }, { rejectWithValue }) => {
    const service = new PostService(postId);
    try {
      const response = await service.addLike(postId);
      return response.data;
    } catch (err) {
      const { status, data } = err.response;
      return rejectWithValue({ status, data });
    }
  }
);
