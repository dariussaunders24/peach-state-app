function formatCalendarDate(dateValue: string) {
  return new Date(dateValue).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function getGoogleCalendarUrl(event: any) {
  const start = formatCalendarDate(event.event_date);

  const end = formatCalendarDate(
    new Date(new Date(event.event_date).getTime() + 3 * 60 * 60 * 1000).toISOString()
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title || "Peach State Event"
  )}&dates=${start}/${end}&details=${encodeURIComponent(
    `View event: https://www.peachstateoffroad.com/events/${event.id}`
  )}&location=${encodeURIComponent(
    event.public_location || event.location || ""
  )}`;
}

export function downloadIcsFile(event: any) {
  const start = formatCalendarDate(event.event_date);

  const end = formatCalendarDate(
    new Date(new Date(event.event_date).getTime() + 3 * 60 * 60 * 1000).toISOString()
  );

  const title = event.title || "Peach State Event";
  const location = event.public_location || event.location || "";
  const description = `View event: https://www.peachstateoffroad.com/events/${event.id}`;

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Peach State Off-Road//Events//EN
BEGIN:VEVENT
UID:${event.id}@peachstateoffroad.com
DTSTAMP:${formatCalendarDate(new Date().toISOString())}
DTSTART:${start}
DTEND:${end}
SUMMARY:${escapeIcsText(title)}
DESCRIPTION:${escapeIcsText(description)}
LOCATION:${escapeIcsText(location)}
URL:https://www.peachstateoffroad.com/events/${event.id}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}