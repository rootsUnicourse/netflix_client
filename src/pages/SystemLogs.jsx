import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import UserContext from '../context/UserContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

// Chip colors for different log levels
const levelColors = {
  info: { bg: '#e3f2fd', color: '#0d47a1' },
  warning: { bg: '#fff8e1', color: '#ff8f00' },
  error: { bg: '#ffebee', color: '#c62828' },
  critical: { bg: '#b71c1c', color: 'white' }
};

const SystemLogs = () => {
  const { user } = useContext(UserContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    level: '',
    action: '',
    startDate: '',
    endDate: ''
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState('');

  // Effect to fetch logs on initial load and when pagination/filters change
  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');

      // Build query parameters
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        excludeAction: 'HTTP Request'
      });

      if (filters.level) params.append('level', filters.level);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', new Date(filters.startDate).toISOString());
      if (filters.endDate) params.append('endDate', new Date(filters.endDate).toISOString());

      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/admin/logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLogs(response.data.logs);
      setTotalCount(response.data.totalCount);
    } catch (err) {
      console.error('Error fetching system logs:', err);
      setError(err.response?.data?.message || 'Failed to fetch system logs');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const applyFilters = () => {
    setPage(0);
    setFilterDialogOpen(false);
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      level: '',
      action: '',
      startDate: '',
      endDate: ''
    });
    setPage(0);
    setFilterDialogOpen(false);
    fetchLogs();
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#141414', color: 'white' }}>
      <Navbar transparent={false} />

      <Container maxWidth="xl" sx={{ pt: 12, pb: 6 }}>
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#1f1f1f', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">System Logs</Typography>

            <Box>
              <IconButton color="primary" onClick={() => setFilterDialogOpen(true)} sx={{ mr: 1 }}>
                <FilterListIcon />
              </IconButton>
              <IconButton color="primary" onClick={fetchLogs}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(255,255,255,0.1)' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Timestamp</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Level</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>IP</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <TableRow 
                          key={log._id} 
                          hover 
                          onClick={() => handleLogClick(log)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                            '& .MuiTableCell-root': { color: 'white' }
                          }}
                        >
                          <TableCell>{formatDate(log.createdAt)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={log.level.toUpperCase()} 
                              size="small"
                              sx={{ 
                                bgcolor: levelColors[log.level]?.bg || '#424242', 
                                color: levelColors[log.level]?.color || 'white',
                                fontWeight: 'bold'
                              }} 
                            />
                          </TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>
                            {log.userId ? (
                              log.userId.emailOrPhone
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ color: '#aaa' }}>
                                System
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{log.ip || 'N/A'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ color: 'white' }}>
                          No logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  color: 'white',
                  '& .MuiSvgIcon-root': { color: 'white' }
                }}
              />
            </>
          )}
        </Paper>
      </Container>

      <Footer />

      {/* Filter Dialog */}
      <Dialog 
        open={filterDialogOpen} 
        onClose={() => setFilterDialogOpen(false)}
        PaperProps={{
          sx: { bgcolor: '#1f1f1f', color: 'white', borderRadius: 2, minWidth: '500px' }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Filter Logs
          <IconButton
            onClick={() => setFilterDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" sx={{ '& label': { color: 'rgba(255,255,255,0.7)' } }}>
                <InputLabel id="level-label">Log Level</InputLabel>
                <Select
                  labelId="level-label"
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  label="Log Level"
                  sx={{
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Action"
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                variant="outlined"
                sx={{
                  '& label': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#E50914' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={{
                  '& label': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#E50914' }
                  },
                  '& .MuiSvgIcon-root': { color: 'white' }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={{
                  '& label': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#E50914' }
                  },
                  '& .MuiSvgIcon-root': { color: 'white' }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          <Button onClick={resetFilters} sx={{ color: 'white' }}>
            Reset
          </Button>
          <Button 
            onClick={applyFilters} 
            variant="contained" 
            color="primary" 
            sx={{ bgcolor: '#E50914', '&:hover': { bgcolor: '#B20710' } }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Log Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { bgcolor: '#1f1f1f', color: 'white', borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Log Details
          <IconButton
            onClick={() => setDetailsDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Timestamp:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedLog.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Action:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.action}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Level:
                </Typography>
                <Chip 
                  label={selectedLog.level.toUpperCase()} 
                  size="small"
                  sx={{ 
                    bgcolor: levelColors[selectedLog.level]?.bg || '#424242', 
                    color: levelColors[selectedLog.level]?.color || 'white',
                    fontWeight: 'bold'
                  }} 
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  User:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.userId ? (
                    `${selectedLog.userId.emailOrPhone} (${selectedLog.userId.role})`
                  ) : (
                    'System'
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  IP Address:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.ip || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Details:
                </Typography>
                <Paper 
                  sx={{ 
                    p: 2, 
                    bgcolor: '#141414', 
                    maxHeight: '300px', 
                    overflow: 'auto',
                    borderRadius: 1
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          <Button 
            onClick={() => setDetailsDialogOpen(false)} 
            variant="contained" 
            color="primary" 
            sx={{ bgcolor: '#E50914', '&:hover': { bgcolor: '#B20710' } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemLogs; 