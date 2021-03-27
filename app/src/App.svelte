<script>

import moment from "moment";
import { onMount, beforeUpdate, afterUpdate } from "svelte";

const socket = io("http://localhost:3030");
const app = feathers();
app.configure(feathers.socketio(socket));

let div;
let autoscroll;

beforeUpdate(() => {
  autoscroll = div && (div.offsetHeight + div.scrollTop) > (div.scrollHeight - 20);
});

afterUpdate(() => {
  if (autoscroll) div.scrollTo(0, div.scrollHeight);
});

onMount(() => {
  console.log("onMount", div);
  console.log("scrollHeight", div.scrollHeight);
  setTimeout(() => {
    if (div) div.scrollTo(0, div.scrollHeight);
  }, 100);
});

export let favorites;
export let channels;

let channel = "physics";
let text = "";
let messages = [];
let messagesOrdered = [];
let sendDisabled = true;
let textDisabled = true;

$: sendDisabled = !text || !channel;
$: textDisabled = !channel;
$: messagesOrdered = messages.slice().reverse();

function select(_channel) {
  channel = _channel;
  load();
}

async function send() {
  const date = new Date();
  const message = { text, date, channel };
  messages = [message, ...messages];
  text = "";
  await app.service("messages").create(message);
}

function sendIfEnter(event) {
  const isEnter = event.key === "Enter";
  const ctrlKey = event.ctrlKey;
  if (isEnter && ! ctrlKey) {
    send();
    event.preventDefault();
  }
}

function format(date) {
  return moment(date).format("MMM Do YY");
}

for (var i = 0, len = 10; i < len; i++) {
  //text = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."
  //send();
}

async function load() {
  const params = {
    query: {
      channel: channel,
      $sort: { createdAt: -1 }
    }
  };
  const res = await app.service("messages").find(params);
  console.log(res);
  messages = res.data;
  console.log("messages", messages);
}

const main = async () => {
  load();
  app.service("messages").on("creates", (message) => {
    messages = [...messages, message];
  });
};

main();

</script>

<main>
  <nav>
    <span class="heading">Favorites</span>
    <ul>
      {#each favorites as channel}
        <li on:click={select(channel)}>#{channel}</li>
      {/each}
    </ul>
    <span class="heading">Channels</span>
    <ul>
      {#each channels as channel}
        <li on:click={select(channel)}>#{channel}</li>
      {/each}
    </ul>
  </nav>
  <section class="center">
    <div class="channel" bind:this={div}>
      <h1>
        #{channel}
      </h1>
      {#each messagesOrdered as message}
        <p>
          <span class="date">{format(message.date)}</span>
          <br />
          {message.text}
        </p>
      {/each}
    </div>
    <section class="input">
      <textarea bind:value={text} disabled={textDisabled} on:keydown={sendIfEnter}></textarea>
      <br />
      <button on:click={send} disabled={sendDisabled}>Send</button>
    </section>
  </section>
</main>

<style>
main {
  margin: 0;
  padding: 0;
  display: flex;
  width: 100vw;
  height: 100vh;
}

nav {
  width: 150px;
  min-width: 150px;
  padding: 10px;
  padding-left: 15px;
  padding-right: 35px;
  background-color: hsl(0, 0%, 98%);
  border-right: 1px solid hsl(0, 0%, 85%);
}

nav ul,
nav li {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

nav li {
  color: hsl(0, 0%, 40%);
  font-size: 13px;
  margin-bottom: 2px;
  margin-left: 5px;
  cursor: pointer;
  transition: 0.3s;
}

nav li:hover {
  color: #2E8FFF;
}

nav ul {
  margin-top: 10px;
  margin-bottom: 10px;
}

nav .heading {
}

section.center {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px;
  height: calc( 100% - 30px );
}

.input {
  display: flex;
  height: 60px;
  bottom: 0;
  padding-top: 10px;
  left: calc( 150px + 15px + 35px + 10px );
  background-color: white;
}

.input textarea {
  flex: 1;
  padding: 5px;
  margin-right: 5px;
  border: 1px solid #B8CCE0;
  transition: 0.3s;
  box-shadow: 0 0 10px 0 transparent;
}

.input textarea:focus {
  outline: none;
  border: 1px solid #2C80E0;
  box-shadow: 0 0 10px 0 #96C7FF;
}

div.channel {
  flex: 1;
  overflow-y: scroll;
  font-size: 14px;
}

div.channel h1 {
  margin: 0;
  padding-bottom: 5px;
  font-size: 14px;
  border-bottom: 1px solid #8FC3FF;
  background-color: white;
  position: sticky;
  top: 0;
}

.date {
  font-size: 11px;
  font-family: Monospace;
  color: hsl(0, 0%, 40%);
}

button {
  border-radius: 0;
  color: #2E8FFF;
  padding: 20px;
  border: 1px solid #2E8FFF;
  background-color: #D4E8FF;
}

button:focus {
  outline: none;
  box-shadow: 0 0 10px 0 #96C7FF;
}

button[disabled] {
  color: hsl(0, 0%, 50%);
  border: 1px solid hsl(0, 0%, 70%);
  background-color: hsl(0, 0%, 95%);
}
</style>
