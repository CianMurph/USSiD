// Imports the Google Cloud client library
const {Logging} = require('@google-cloud/logging');

// Creates a client
const logging = new Logging();

/**
 * TODO(developer): Uncomment the following line to run the code.
 */
 const logName = 'ussd_crud(us-central1)';

const log = logging.log(logName);

async function printEntryMetadata() {
  // List the most recent entries for a given log
  // See https://googleapis.dev/nodejs/logging/latest/Logging.html#getEntries
  const [entries] = await log.getEntries();
  console.log('Logs:');
  entries.forEach(entry => {
    const metadata = entry.metadata;
    console.log(`${metadata.timestamp}:`, metadata[metadata.payload]);
  });
}
printEntryMetadata();