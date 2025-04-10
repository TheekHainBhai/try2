import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  LinearProgress,
  Chip,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  WarningAmber,
  CheckCircle,
  TrendingUp,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  LocalShipping,
  Inventory,
  Assessment,
  Timeline,
  Category,
  Speed,
  NotificationsActive,
  PriorityHigh,
  CalendarToday,
  TrendingDown,
  Person,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const MotionCard = motion(Card);

const Dashboard = () => {
  const stats = [
    {
      title: 'Active Complaints',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: <WarningAmber fontSize="large" />,
      color: '#ff9800',
      bgColor: '#fff3e0',
      details: [
        { label: 'High Priority', value: '8', icon: <PriorityHigh fontSize="small" color="error" /> },
        { label: 'This Week', value: '15', icon: <CalendarToday fontSize="small" color="primary" /> },
        { label: 'Response Rate', value: '92%', icon: <Speed fontSize="small" color="success" /> },
      ],
    },
    {
      title: 'Resolved Issues',
      value: '156',
      change: '+8%',
      trend: 'up',
      icon: <CheckCircle fontSize="large" />,
      color: '#4caf50',
      bgColor: '#e8f5e9',
      details: [
        { label: 'Avg Time', value: '48h', icon: <Timeline fontSize="small" color="primary" /> },
        { label: 'Satisfaction', value: '94%', icon: <TrendingUp fontSize="small" color="success" /> },
        { label: 'Reopened', value: '3%', icon: <TrendingDown fontSize="small" color="error" /> },
      ],
    },
    {
      title: 'Quality Score',
      value: '4.8',
      change: '-2%',
      trend: 'down',
      icon: <Assessment fontSize="large" />,
      color: '#2196f3',
      bgColor: '#e3f2fd',
      details: [
        { label: 'Reviews', value: '1.2k', icon: <Person fontSize="small" color="primary" /> },
        { label: '5 Star', value: '68%', icon: <TrendingUp fontSize="small" color="success" /> },
        { label: 'New', value: '+125', icon: <NotificationsActive fontSize="small" color="warning" /> },
      ],
    },
    {
      title: 'Pending Reviews',
      value: '38',
      change: '+5%',
      trend: 'up',
      icon: <Assessment fontSize="large" />,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
      details: [
        { label: 'Critical', value: '12', icon: <PriorityHigh fontSize="small" color="error" /> },
        { label: 'Today', value: '8', icon: <CalendarToday fontSize="small" color="primary" /> },
        { label: 'Processing', value: '18', icon: <Timeline fontSize="small" color="info" /> },
      ],
    },
  ];

  const recentIncidents = [
    {
      id: 'INC-2025-001',
      product: 'Organic Milk',
      company: 'Fresh Dairy Ltd',
      status: 'Under Investigation',
      priority: 'High',
      date: '2025-04-08',
      icon: <LocalShipping />,
    },
    {
      id: 'INC-2025-002',
      product: 'Whole Wheat Bread',
      company: 'Healthy Bakers Co',
      status: 'Pending Review',
      priority: 'Medium',
      date: '2025-04-08',
      icon: <Inventory />,
    },
    {
      id: 'INC-2025-003',
      product: 'Fresh Yogurt',
      company: 'Pure Foods Inc',
      status: 'Resolved',
      priority: 'Low',
      date: '2025-04-07',
      icon: <Category />,
    },
  ];

  const categories = [
    { name: 'Dairy Products', progress: 85 },
    { name: 'Packaged Foods', progress: 72 },
    { name: 'Beverages', progress: 90 },
    { name: 'Snacks', progress: 68 },
  ];

  const pieChartData = [
    { name: 'Quality Issues', value: 35, color: '#ef5350' },
    { name: 'Packaging', value: 25, color: '#42a5f5' },
    { name: 'Delivery', value: 20, color: '#66bb6a' },
    { name: 'Other', value: 20, color: '#ffa726' },
  ];

  const topPerformers = [
    { name: 'Fresh Foods Inc', score: 98, avatar: 'FF' },
    { name: 'Organic Farms Ltd', score: 95, avatar: 'OF' },
    { name: 'Pure Dairy Co', score: 92, avatar: 'PD' },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Cards Row */}
        <Grid item container spacing={3} xs={12}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover-card"
                sx={{ height: '100%', position: 'relative', overflow: 'visible' }}
              >
                <CardContent>
                  <Box sx={{ position: 'absolute', top: -20, right: 20 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: stat.bgColor,
                        color: stat.color,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                  <Box sx={{ mb: 3 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Chip
                      icon={stat.trend === 'up' ? <ArrowUpward /> : <ArrowDownward />}
                      label={stat.change}
                      size="small"
                      color={stat.trend === 'up' ? 'success' : 'error'}
                      sx={{ height: 24 }}
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {stat.details.map((detail, idx) => (
                      <ListItem key={idx} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {detail.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={detail.label}
                          secondary={detail.value}
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 'medium' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Row */}
        <Grid item container spacing={3} xs={12}>
          {/* Left Column: Recent Incidents */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Recent Incidents Card */}
              <Grid item xs={12}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="hover-card"
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Recent Incidents
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Latest reported quality issues
                        </Typography>
                      </Box>
                      <IconButton>
                        <MoreVert />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {recentIncidents.map((incident, index) => (
                        <Box key={incident.id}>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: 
                                  incident.status === 'Under Investigation' ? 'warning.light' :
                                  incident.status === 'Resolved' ? 'success.light' : 'info.light',
                                color:
                                  incident.status === 'Under Investigation' ? 'warning.main' :
                                  incident.status === 'Resolved' ? 'success.main' : 'info.main',
                              }}
                            >
                              {incident.icon}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                  {incident.product}
                                </Typography>
                                <Chip
                                  label={incident.priority}
                                  size="small"
                                  color={
                                    incident.priority === 'High' ? 'error' :
                                    incident.priority === 'Medium' ? 'warning' : 'success'
                                  }
                                  sx={{ height: 24 }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {incident.company} • {incident.status}
                              </Typography>
                            </Box>
                          </Box>
                          {index < recentIncidents.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        endIcon={<Timeline />}
                        sx={{ borderRadius: 4 }}
                      >
                        View All Incidents
                      </Button>
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>

              {/* Category Performance Card */}
              <Grid item xs={12}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="hover-card"
                >
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Category Performance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Quality metrics by category
                    </Typography>
                    <Box sx={{ mt: 4 }}>
                      {categories.map((category, index) => (
                        <Box key={index} sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{category.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {category.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={category.progress}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'grey.100',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${
                                  category.progress > 80 ? '#4caf50' :
                                  category.progress > 60 ? '#2196f3' : '#ff9800'
                                } 0%, ${
                                  category.progress > 80 ? '#81c784' :
                                  category.progress > 60 ? '#64b5f6' : '#ffb74d'
                                } 100%)`,
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column: Issue Distribution and Top Performers */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3}>
              {/* Issue Distribution Card */}
              <Grid item xs={12}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="hover-card"
                >
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Issue Distribution
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Types of reported issues
                    </Typography>
                    <Box sx={{ height: 200, mt: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      {pieChartData.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: item.color,
                            }}
                          />
                          <Typography variant="body2">
                            {item.name} ({item.value}%)
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>

              {/* Top Performers Card */}
              <Grid item xs={12}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="hover-card"
                >
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Top Performers
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Highest quality scores
                    </Typography>
                    <List>
                      {topPerformers.map((performer, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            px: 0,
                            borderBottom: index < topPerformers.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: 'primary.light',
                              color: 'primary.main',
                              mr: 2,
                            }}
                          >
                            {performer.avatar}
                          </Avatar>
                          <ListItemText
                            primary={performer.name}
                            secondary={`Quality Score: ${performer.score}`}
                          />
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            sx={{
                              bgcolor: index === 0 ? 'warning.light' : 'default',
                              color: index === 0 ? 'warning.dark' : 'default',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </MotionCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
