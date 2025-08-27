///////////////////////////////////////////////////////////////////////////////
// Node Imports
///////////////////////////////////////////////////////////////////////////////
import { describe, it } from "node:test";

///////////////////////////////////////////////////////////////////////////////
// 3PP Imports
///////////////////////////////////////////////////////////////////////////////
import { assert } from "chai";
import request from "supertest";

///////////////////////////////////////////////////////////////////////////////
// Local Imports
///////////////////////////////////////////////////////////////////////////////
import { HTTP_ERROR_NAMES } from "../src";
import app from "./app";

///////////////////////////////////////////////////////////////////////////////
// Helpers
///////////////////////////////////////////////////////////////////////////////
function checkResponseBodyFormat( body: any, expectedStatus: number ) {
  assert( "string" === typeof body.errorId );
  assert( body.errorName && HTTP_ERROR_NAMES.includes( body.errorName ) );
  assert( "string" === typeof body.message );
  assert( body.status === expectedStatus );
  assert( "string" === typeof body.description );
}

///////////////////////////////////////////////////////////////////////////////
// Tests
///////////////////////////////////////////////////////////////////////////////
describe("Test HTTP Errors", () => {
  describe("Basic Error Creation", () => {
    it("Should return a basic 403 error", async () => {
      const { body, status } = await request(app).get("/basic403");

      checkResponseBodyFormat( body, 403 );
      assert( status === 403 );
      assert( body.errorName === "forbidden" );
    }),
    it("Should return a basic 409 error", async () => {
      const { body, status } = await request(app).get("/basic409");

      checkResponseBodyFormat( body, 409 );
      assert( status === 409 );
      assert( body.errorName === "conflict" );
    })
  }),
  describe("Problem Details", () => {
    it("Should return a default 400 problem detail", async () => {
      const { body, status, headers } = await request(app).get("/problem400");

      assert( status === 400 );
      assert( body.type === "about:blank" );
      assert( body.title === "The server cannot or will not process the request due to an apparent client error." );
      assert( body.status === 400 );

      assert( headers["content-type"].includes( "application/problem+json" ) );
    }),
    it("Should return a detailed 422 problem detail", async () => {
      const { body, status, headers } = await request(app).get("/problem422");

      assert( status === 422 );
      assert( body.type === "https://example.com/probs/out-of-credit" );
      assert( body.title === "You do not have enough credit." );
      assert( body.detail === "Your current balance is 30, but that costs 50." );
      assert( body.instance === "/account/12345/msgs/abc" );
      assert( body.status === 422 );

      assert( headers["content-type"].includes( "application/problem+json" ) );
    })
  }),
  describe("Automatically-Generated Errors", () => {
    it("Should return a 500 from a generic error", async () => {
      const { body, status } = await request(app).get("/default500");

      checkResponseBodyFormat( body, 500 );
      assert( status === 500 );
      assert( body.errorName === "internalServerError" );
    })
  })
})
