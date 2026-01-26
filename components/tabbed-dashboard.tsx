"use client"

import { LeadCard } from "@/components/lead-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AlertCircle, Calendar, Clock, CalendarDays } from "lucide-react"
import type { LeadWithRelations } from "@/lib/lead-utils"

interface DashboardData {
    totalLeads: number
    overdue: LeadWithRelations[]
    dueToday: LeadWithRelations[]
    dueNext7Days: LeadWithRelations[]
    arrivingToday: LeadWithRelations[]
    arrivingTomorrow: LeadWithRelations[]
}

interface TabbedDashboardProps {
    data: DashboardData
}

export function TabbedDashboard({ data }: TabbedDashboardProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle>Follow-up Tasks</CardTitle>
                <CardDescription>
                    Manage your leads by their follow-up status
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overdue">
                    <TabsList className="flex flex-wrap gap-1">
                        <TabsTrigger value="overdue" className="gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            Overdue
                            <Badge variant="destructive" className="ml-1">
                                {data.overdue.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="today" className="gap-2">
                            <Clock className="h-4 w-4" />
                            Due Today
                            <Badge variant="secondary" className="ml-1">
                                {data.dueToday.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="next7days" className="gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Next 7 Days
                            <Badge variant="secondary" className="ml-1">
                                {data.dueNext7Days.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="arriving-today" className="gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Arriving Today
                            <Badge className="ml-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {data.arrivingToday.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="arriving-tomorrow" className="gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Arriving Tomorrow
                            <Badge className="ml-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {data.arrivingTomorrow.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overdue">
                        {data.overdue.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>No overdue leads</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {data.overdue.map((lead) => (
                                    <LeadCard key={lead.id} lead={lead} showUrgency />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="today">
                        {data.dueToday.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>No leads due today</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {data.dueToday.map((lead) => (
                                    <LeadCard key={lead.id} lead={lead} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="next7days">
                        {data.dueNext7Days.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <CalendarDays className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>No leads due in the next 7 days</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {data.dueNext7Days.map((lead) => (
                                    <LeadCard key={lead.id} lead={lead} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="arriving-today">
                        {data.arrivingToday.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>No leads arriving today</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {data.arrivingToday.map((lead) => (
                                    <LeadCard key={lead.id} lead={lead} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="arriving-tomorrow">
                        {data.arrivingTomorrow.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>No leads arriving tomorrow</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {data.arrivingTomorrow.map((lead) => (
                                    <LeadCard key={lead.id} lead={lead} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
