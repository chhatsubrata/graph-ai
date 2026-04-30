import {
    AudioWaveform,
    Command,
    Frame,
    Map,
    PieChart,
} from "lucide-react"

export const data = {
    user: {
        name: "GraphAI",
        email: "graphai@gmail.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "Graph AI",
            logo: Command,
            plan: "Enterprise",
        },
        {
            name: "Candi AI",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Kron AI",
            logo: Command,
            plan: "Free",
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Travel",
            url: "#",
            icon: Map,
        },
    ],
    recents: [
        {
            name: "Project Management & Task Tracking",
            url: "#",
            emoji: "📊",
        },
        {
            name: "Family Recipe Collection & Meal Planning",
            url: "#",
            emoji: "🍳",
        },
        {
            name: "Fitness Tracker & Workout Routines",
            url: "#",
            emoji: "💪",
        },
        {
            name: "Book Notes & Reading List",
            url: "#",
            emoji: "📚",
        },
        {
            name: "Sustainable Gardening Tips & Plant Care",
            url: "#",
            emoji: "🌱",
        },
        {
            name: "Language Learning Progress & Resources",
            url: "#",
            emoji: "🗣️",
        },
        {
            name: "Home Renovation Ideas & Budget Tracker",
            url: "#",
            emoji: "🏠",
        },
        {
            name: "Personal Finance & Investment Portfolio",
            url: "#",
            emoji: "💰",
        },
        {
            name: "Movie & TV Show Watchlist with Reviews",
            url: "#",
            emoji: "🎬",
        },
        {
            name: "Daily Habit Tracker & Goal Setting",
            url: "#",
            emoji: "✅",
        },
    ],
}
