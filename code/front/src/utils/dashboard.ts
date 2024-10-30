interface Ping {
  timestamp: Date;
  status: 'up' | 'down';
  responseTime: number;
}

interface Service {
  name: string;
  pings: Ping[];
}

const FETCH_INTERVAL = 60000;
let lastFetchTime = 0;

function getUptimeColor(uptime: number): string {
  if (uptime >= 99) return 'text-green-600';
  if (uptime >= 95) return 'text-yellow-600';
  return 'text-red-600';
}

function getResponseTimeColor(time: number): string {
  if (time <= 200) return 'text-green-600';
  if (time <= 400) return 'text-yellow-600';
  return 'text-red-600';
}

function getStatusIcon(status: 'up' | 'down'): string {
  return status === 'up'
    ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
    : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
}

function getStatusColor(responseTime: number, status: 'up' | 'down'): string {
  if (status === 'down') return 'bg-red-500';
  if (responseTime <= 200) return 'bg-green-500';
  if (responseTime <= 400) return 'bg-yellow-500';
  return 'bg-red-500';
}

function updateStatusSummary(status: 'up' | 'down'): void {
  const summaryEl = document.querySelector('[data-status-summary]');
  if (!summaryEl) return;

  const statusHTML = `
    <span class="mr-3">
      ${
        status === 'up'
          ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
          : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
      }
    </span>
    <span class="text-lg">
      ${status === 'up' ? 'All Systems Operational' : 'System Issues Detected'}
    </span>
  `;

  summaryEl.className = `flex items-center px-6 py-4 rounded-xl font-semibold border ${
    status === 'up'
      ? 'bg-green-50 text-green-800 border-green-200'
      : 'bg-red-50 text-red-800 border-red-200'
  }`;
  summaryEl.innerHTML = statusHTML;
}

function updateServiceTimeline(service: Service): void {
  const timelineEl = document.createElement('div');
  timelineEl.className =
    'bg-white rounded-xl p-6 shadow-sm border border-gray-100';

  const currentPing = service.pings[service.pings.length - 1];
  const uptime = (
    (service.pings.filter((ping) => ping.status === 'up').length /
      service.pings.length) *
    100
  ).toFixed(2);
  const avgResponseTime =
    service.pings
      .filter((ping) => ping.status === 'up')
      .reduce((sum, ping) => sum + ping.responseTime, 0) /
    service.pings.filter((ping) => ping.status === 'up').length;

  timelineEl.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-2 h-2 rounded-full relative">
          <div class="${getStatusColor(
            currentPing.responseTime,
            currentPing.status
          )} w-2 h-2 rounded-full"></div>
          <div class="${getStatusColor(
            currentPing.responseTime,
            currentPing.status
          )} w-2 h-2 rounded-full absolute inset-0 animate-ping opacity-75"></div>
        </div>
        <h2 class="text-xl font-semibold text-gray-800">${service.name}</h2>
      </div>
      <div class="flex items-center space-x-3">
        <span class="inline-flex items-center space-x-1 text-sm font-medium px-3 py-1 rounded-full ${
          currentPing.status === 'up'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }">
          ${getStatusIcon(currentPing.status)}
          <span>${currentPing.status.toUpperCase()}</span>
        </span>
      </div>
    </div>

    <div class="flex gap-1 items-center mb-6 h-12 bg-gray-50 rounded-lg px-2 overflow-hidden">
      ${service.pings
        .map(
          (ping) => `
        <div
          class="flex-1 h-8 rounded ${
            ping.status === 'up'
              ? `${getStatusColor(
                  ping.responseTime,
                  ping.status
                )} bg-opacity-50 hover:bg-opacity-100`
              : 'bg-red-500 bg-opacity-50 hover:bg-opacity-100'
          }"
          title="${new Date(ping.timestamp).toLocaleDateString()} ${new Date(
            ping.timestamp
          ).toLocaleTimeString()}
Status: ${ping.status.toUpperCase()}
Response Time: ${ping.responseTime}ms"
        ></div>
      `
        )
        .join('')}
    </div>

    <div class="flex justify-between items-center text-sm px-1">
      <div class="flex flex-col">
        <span class="text-gray-500 mb-1">Uptime</span>
        <span class="font-bold text-lg ${getUptimeColor(
          parseFloat(uptime)
        )}">${uptime}%</span>
      </div>
      <div class="h-12 w-px bg-gray-200"></div>
      <div class="flex flex-col items-end">
        <span class="text-gray-500 mb-1">Response Time</span>
        <span class="font-bold text-lg ${getResponseTimeColor(
          avgResponseTime
        )}">${avgResponseTime.toFixed(0)}ms</span>
      </div>
    </div>
  `;

  const timelinesContainer = document.getElementById('service-timelines');
  if (timelinesContainer) {
    timelinesContainer.appendChild(timelineEl);
  }
}

function updateCommunications(services: Service[]): void {
  const communicationsEl = document.querySelector('[data-communications]');
  if (!communicationsEl) return;

  import('./communications').then(({ generateCommunications }) => {
    const communications = generateCommunications(services);

    communicationsEl.innerHTML = `
      <ul class="space-y-6">
        ${communications
          .map(
            (message) => `
          <li class="flex items-start group">
            <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
              message.type === 'investigating'
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-green-100 text-green-600'
            }">
              ${
                message.type === 'investigating'
                  ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                  : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
              }
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium mb-1 ${
                message.type === 'investigating'
                  ? 'text-yellow-600'
                  : 'text-green-600'
              }">
                ${
                  message.type === 'investigating'
                    ? 'Investigating Issue'
                    : 'All Systems Operational'
                }
              </p>
              <p class="text-gray-800 mb-2">${message.message}</p>
              <p class="text-sm text-gray-500">${message.timestamp.toLocaleString()}</p>
            </div>
          </li>
        `
          )
          .join('')}
      </ul>
    `;
  });
}

async function fetchAndUpdateData(): Promise<void> {
  try {
    const now = Date.now();
    if (now - lastFetchTime < FETCH_INTERVAL) return;
    lastFetchTime = now;

    const response = await fetch(
      'https://raw.githubusercontent.com/SegoCode/LiteStatus/main/code/ping/pingResults.json'
    );
    const services = await response.json();

    const transformedServices = services.map((service: any) => ({
      ...service,
      pings: service.pings.map((ping: any) => ({
        ...ping,
        timestamp: new Date(ping.timestamp),
      })),
    }));

    const overallStatus = transformedServices.every(
      (service: Service) =>
        service.pings[service.pings.length - 1].status === 'up'
    )
      ? 'up'
      : 'down';

    const timelinesContainer = document.getElementById('service-timelines');
    if (timelinesContainer) {
      timelinesContainer.innerHTML = '';
    }

    const latestPingTimestamp = transformedServices.reduce(
      (latest, service) => {
        const serviceLatest = service.pings[service.pings.length - 1].timestamp;
        return latest > serviceLatest ? latest : serviceLatest;
      },
      new Date(0)
    );

    updateStatusSummary(overallStatus);
    transformedServices.forEach((service: Service) =>
      updateServiceTimeline(service)
    );
    updateCommunications(transformedServices);

    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = `Last updated: ${latestPingTimestamp.toLocaleString()}`;
    }
  } catch (error) {
    console.error('Error fetching or processing data:', error);
    const timelinesContainer = document.getElementById('service-timelines');
    if (timelinesContainer) {
      timelinesContainer.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
          <p class="font-medium">Unable to fetch LiteStatus</p>
          <p class="text-sm mt-1">Please try again later</p>
        </div>
      `;
    }
  }
}

export function setupDashboard(): void {
  fetchAndUpdateData();
  setInterval(fetchAndUpdateData, FETCH_INTERVAL);
}
