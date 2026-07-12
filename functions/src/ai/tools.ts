import { 
  getLandlordInvoices, 
  getLandlordContracts, 
  getLandlordSupportRequests,
  getLandlordBuildings,
  getLandlordRooms
} from '../utils/firestore';

export const agentTools = [
  {
    type: 'function',
    function: {
      name: 'get_overdue_invoices',
      description: 'Lấy danh sách các hóa đơn quá hạn/chờ thanh toán của chủ nhà. Chỉ trả về dữ liệu tối giản phục vụ phân tích.',
      parameters: {
        type: 'object',
        properties: {
          buildingId: { type: 'string', description: 'Lọc hóa đơn theo ID tòa nhà (tùy chọn)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_expiring_contracts',
      description: 'Lấy danh sách các hợp đồng thuê phòng sắp hết hạn trong vòng 30 ngày tới.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_open_support_requests',
      description: 'Lấy danh sách các phản ánh/yêu cầu sửa chữa sửa của cư dân đang ở trạng thái chờ xử lý (pending).',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_buildings_and_rooms',
      description: 'Lấy danh sách tất cả các tòa nhà và phòng trọ do chủ nhà này quản lý kèm trạng thái trống/đang ở.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
];

/**
 * Execute the selected tool safely on behalf of the landlord ownerId
 */
export async function executeTool(name: string, args: any, ownerId: string): Promise<any> {
  try {
    switch (name) {
      case 'get_overdue_invoices': {
        const invoices = await getLandlordInvoices(ownerId);
        const filtered = args.buildingId 
          ? invoices.filter(i => i.buildingId === args.buildingId)
          : invoices;
        
        return filtered.map(i => ({
          id: i.id,
          roomCode: i.roomCode,
          buildingName: i.buildingName,
          month: i.month,
          amount: i.amount,
          tenantName: i.tenantName,
          dueDate: i.dueDate ? (i.dueDate.toDate ? i.dueDate.toDate().toISOString() : i.dueDate) : null
        }));
      }

      case 'get_expiring_contracts': {
        const contracts = await getLandlordContracts(ownerId);
        const today = new Date();
        const expiring = [];
        for (const c of contracts) {
          if (c.endDate) {
            const parts = c.endDate.split('/');
            if (parts.length === 3) {
              const endD = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
              const diffDays = Math.ceil((endD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays >= 0 && diffDays <= 30) {
                expiring.push({
                  id: c.id,
                  tenantName: c.tenantName,
                  roomCode: c.roomCode,
                  buildingName: c.buildingName,
                  endDate: c.endDate,
                  diffDays
                });
              }
            }
          }
        }
        return expiring;
      }

      case 'get_open_support_requests': {
        const requests = await getLandlordSupportRequests(ownerId);
        return requests.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          level: r.level,
          roomCode: r.roomCode,
          buildingName: r.buildingName,
          status: r.status
        }));
      }

      case 'get_buildings_and_rooms': {
        const buildings = await getLandlordBuildings(ownerId);
        const rooms = await getLandlordRooms(ownerId);
        return {
          buildings: buildings.map(b => ({ id: b.id, name: b.name })),
          rooms: rooms.map(r => ({ id: r.id, code: r.code, buildingId: r.buildingId, status: r.status }))
        };
      }

      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (err: any) {
    return { error: err.message || 'Error executing tool' };
  }
}
