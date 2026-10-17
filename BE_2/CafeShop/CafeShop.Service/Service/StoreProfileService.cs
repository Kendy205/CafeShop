using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.StoreProfile;
using CafeShop.Model;
using CafeShop.Service.IService;
using CafeShop.Uitls;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CafeShop.Service.Service
{
    public class StoreProfileService : IStoreProfileService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public StoreProfileService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<StoreProfileDto> GetStoreProfileAsync()
        {
            var profile = await _unitOfWork.StoreProfile.GetFirstOrDefaultAsync(x => true);
            
            if (profile == null)
            {
                // Khởi tạo bản ghi mặc định nếu chưa có
                profile = new StoreProfile
                {
                    StoreName = "Tên quán mặc định",
                    IsAcceptingOrders = true,
                    IsRealtimeNotificationEnabled = true,
                    IsMaintenanceMode = false,
                    OpenTime = new TimeSpan(7, 0, 0),
                    CloseTime = new TimeSpan(22, 0, 0),
                    CreatedAt = DateTimeHelper.VietnamNow,
                    UpdatedAt = DateTimeHelper.VietnamNow
                };
                
                await _unitOfWork.StoreProfile.AddAsync(profile);
                await _unitOfWork.SaveAsync();
            }

            var result = _mapper.Map<StoreProfileDto>(profile);
            result.IsOpenNow = profile.CheckCanAcceptOrders().CanAccept;
            return result;
        }

        public async Task<StoreProfileDto> UpdateStoreProfileAsync(UpdateStoreProfileDto dto)
        {
            var profile = await _unitOfWork.StoreProfile.GetFirstOrDefaultAsync(x => true);
            
            if (profile == null)
            {
                profile = new StoreProfile
                {
                    CreatedAt = DateTimeHelper.VietnamNow
                };
                await _unitOfWork.StoreProfile.AddAsync(profile);
            }

            _mapper.Map(dto, profile);
            profile.UpdatedAt = DateTimeHelper.VietnamNow;

            await _unitOfWork.SaveAsync();

            var result = _mapper.Map<StoreProfileDto>(profile);
            result.IsOpenNow = profile.CheckCanAcceptOrders().CanAccept;
            return result;
        }
    }
}
